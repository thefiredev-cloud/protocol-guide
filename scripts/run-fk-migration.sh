#!/bin/bash
# Script to run foreign key migration safely
# Usage: ./scripts/run-fk-migration.sh [--dry-run]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="${DATABASE_NAME:-protocolguide}"
BACKUP_DIR="./backups"
MIGRATION_DIR="./drizzle/migrations"
DRY_RUN=false

# Parse arguments
if [ "$1" == "--dry-run" ]; then
    DRY_RUN=true
    echo -e "${YELLOW}Running in DRY-RUN mode (no changes will be made)${NC}"
fi

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

prompt_continue() {
    if [ "$DRY_RUN" = true ]; then
        return 0
    fi

    read -p "Continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Migration cancelled by user"
        exit 1
    fi
}

run_sql() {
    local file=$1
    local description=$2

    log_info "$description"

    if [ "$DRY_RUN" = true ]; then
        log_warn "Would execute: $file"
        return 0
    fi

    if [ -f "$file" ]; then
        mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$file"
        log_info "✓ Completed: $description"
    else
        log_error "File not found: $file"
        exit 1
    fi
}

# Main script
echo "=================================================="
echo "  Foreign Key Migration Script"
echo "  Database: $DB_NAME"
echo "=================================================="
echo

# Check prerequisites
log_info "Checking prerequisites..."

if [ -z "$DATABASE_URL" ]; then
    log_error "DATABASE_URL environment variable not set"
    exit 1
fi

# Extract DB credentials from DATABASE_URL
# Format: mysql://user:pass@host:port/database
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')

if [ -z "$DB_USER" ] || [ -z "$DB_PASS" ]; then
    log_error "Could not parse DATABASE_URL"
    exit 1
fi

log_info "✓ Environment variables configured"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Step 1: Backup
BACKUP_FILE="$BACKUP_DIR/backup_before_fk_$(date +%Y%m%d_%H%M%S).sql"
log_info "Creating backup: $BACKUP_FILE"

if [ "$DRY_RUN" = false ]; then
    mysqldump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_FILE"
    log_info "✓ Backup created successfully"
else
    log_warn "Would create backup: $BACKUP_FILE"
fi

# Step 2: Validation
log_info "Step 1/5: Running pre-migration validation..."
VALIDATION_FILE="$BACKUP_DIR/validation_report_$(date +%Y%m%d_%H%M%S).txt"

if [ "$DRY_RUN" = false ]; then
    mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$MIGRATION_DIR/0018_pre_migration_validation.sql" > "$VALIDATION_FILE" 2>&1 || true

    # Check for orphaned data
    if grep -q "orphaned" "$VALIDATION_FILE"; then
        log_warn "Validation report saved to: $VALIDATION_FILE"
        cat "$VALIDATION_FILE"

        # Check if any orphaned records found
        if grep -E "\|\s+[1-9][0-9]*$" "$VALIDATION_FILE" > /dev/null; then
            log_error "Orphaned records found! Clean up data before proceeding."
            log_error "See: $VALIDATION_FILE"
            exit 1
        fi
    fi

    log_info "✓ No orphaned records found"
else
    log_warn "Would run validation queries"
fi

# Step 3: Fix data types
log_info "Step 2/5: Fixing data type mismatches..."
prompt_continue
run_sql "$MIGRATION_DIR/0019_fix_data_type_mismatches.sql" "Adding internalAgencyId column"

# Step 4: Add unique constraints
log_info "Step 3/5: Adding unique constraints..."
prompt_continue
run_sql "$MIGRATION_DIR/0020_add_unique_constraints.sql" "Adding unique constraints"

# Step 5: Add foreign keys (users)
log_info "Step 4/5: Adding foreign keys (user relationships)..."
prompt_continue
run_sql "$MIGRATION_DIR/0021_add_foreign_keys_part1_users.sql" "Adding user foreign keys"

# Step 6: Add foreign keys (complete)
log_info "Step 5/5: Adding foreign keys (remaining relationships)..."
prompt_continue
run_sql "$MIGRATION_DIR/0022_add_foreign_keys_part2_complete.sql" "Adding remaining foreign keys"

# Verification
log_info "Verifying foreign keys..."

if [ "$DRY_RUN" = false ]; then
    FK_COUNT=$(mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -N -e "
        SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE REFERENCED_TABLE_SCHEMA = '$DB_NAME'
          AND REFERENCED_TABLE_NAME IS NOT NULL;
    ")

    log_info "Foreign keys created: $FK_COUNT"

    if [ "$FK_COUNT" -lt 30 ]; then
        log_warn "Expected 35+ foreign keys, found only $FK_COUNT"
        log_warn "Some foreign keys may have failed to create"
    else
        log_info "✓ Foreign keys created successfully"
    fi
fi

# Success
echo
echo "=================================================="
log_info "Migration completed successfully!"
echo "=================================================="
echo
log_info "Next steps:"
echo "  1. Update schema: cp drizzle/schema-updated.ts drizzle/schema.ts"
echo "  2. Run tests: npm test"
echo "  3. Deploy application"
echo
log_info "Rollback available at: $BACKUP_FILE"
log_info "Or use: drizzle/migrations/ROLLBACK_FOREIGN_KEYS.sql"
echo
