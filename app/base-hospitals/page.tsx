import { DivisionHospitalDirectory } from '@/app/components/directories/division-hospital-directory';

export const metadata = {
  title: 'Base Hospital Directory | Medic Bot',
  description: 'LA County EMS Base Hospital contact directory organized by geographic division'
};

export default function BaseHospitalsPage() {
  return (
    <main style={{ minHeight: '100vh', paddingTop: '60px' }}>
      <DivisionHospitalDirectory />
    </main>
  );
}
