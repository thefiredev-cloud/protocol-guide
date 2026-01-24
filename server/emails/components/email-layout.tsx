/**
 * Shared email layout component
 * Used by all Protocol Guide transactional emails
 */
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://protocol-guide.com/logo.png"
              width="150"
              height="40"
              alt="Protocol Guide"
            />
          </Section>
          {children}
          <Section style={footer}>
            <Text style={footerText}>
              Protocol Guide - EMS Protocol Reference
            </Text>
            <Text style={footerText}>
              This is a transactional email. You received this because you have an account.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header: React.CSSProperties = {
  padding: '32px 48px',
  borderBottom: '1px solid #e6ebf1',
};

const footer: React.CSSProperties = {
  padding: '32px 48px',
  borderTop: '1px solid #e6ebf1',
};

const footerText: React.CSSProperties = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0',
};
