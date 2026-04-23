import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface ClaimAccountEmailProps {
  businessName: string
  claimUrl: string
}

const LOGO_URL = 'https://pwnuawhrgycjdnmfchou.supabase.co/storage/v1/object/public/assets/logo-email.png'

export default function ClaimAccountEmail({ businessName, claimUrl }: ClaimAccountEmailProps) {
  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        `}</style>
      </Head>
      <Preview>Claim your Service4Me stylist account</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={LOGO_URL}
              width="50"
              height="21"
              alt="Service4Me"
              style={logoImage}
            />
          </Section>
          <Heading style={heading}>Welcome to Service4Me</Heading>
          <Text style={paragraph}>
            Hi {businessName},
          </Text>
          <Text style={paragraph}>
            An account has been created for you on Service4Me. Click the button below to set your password and start managing your profile.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={claimUrl}>
              Claim Your Account
            </Button>
          </Section>
          <Text style={paragraph}>
            Once you've set your password, you'll be able to:
          </Text>
          <Text style={listItem}>- Edit your business profile and services</Text>
          <Text style={listItem}>- Upload portfolio images</Text>
          <Text style={listItem}>- Manage your bookings and availability</Text>
          <Text style={listItem}>- Respond to client reviews</Text>
          <Hr style={hr} />
          <Text style={footer}>
            If you didn't expect this email, you can safely ignore it. This link will expire in 24 hours.
          </Text>
          <Text style={footer}>
            Service4Me - Find and book beauty professionals near you
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

ClaimAccountEmail.PreviewProps = {
  businessName: 'TM Hair',
  claimUrl: 'https://service4me.co.uk/auth/confirm?token_hash=example&type=recovery',
} satisfies ClaimAccountEmailProps

const fontFamily = '"DM Sans", "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily,
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
  borderRadius: '8px',
}

const logoContainer = {
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const logoImage = {
  margin: '0 auto',
}

const heading = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600' as const,
  fontFamily,
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const paragraph = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '26px',
  fontFamily,
  margin: '0 0 16px',
}

const listItem = {
  color: '#4a4a4a',
  fontSize: '15px',
  lineHeight: '24px',
  fontFamily,
  margin: '0 0 4px',
  paddingLeft: '8px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '0',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600' as const,
  fontFamily,
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 32px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const footer = {
  color: '#9ca3af',
  fontSize: '13px',
  lineHeight: '20px',
  fontFamily,
  margin: '0 0 8px',
  textAlign: 'center' as const,
}
