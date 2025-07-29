"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import {
  Badge,
  Button,
  Card,
  Column,
  Heading,
  Icon,
  LetterFx,
  Row,
  Text
} from "@once-ui-system/core";
import { motion } from "motion/react";
import {
  FiBookOpen,
  FiShield,
  FiZap
} from "react-icons/fi";

export default function Home() {
  const { isSignedIn } = useUser();

  return (
    <Column fillWidth style={{ minHeight: "100vh" }}>
      {/* Hero Section */}
      <Column maxWidth="xl" padding="l" horizontal="center">
        <Column horizontal="center" align="center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge
              textVariant="code-default-s"
              border="neutral-alpha-medium"
              onBackground="neutral-medium"
              vertical="center"
              gap="16"
              marginBottom="l"
            >
              <FiZap size={16} />
              <Text marginX="4">
                <LetterFx trigger="instant">AI-Powered Legal Document Analysis</LetterFx>
              </Text>
            </Badge>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Heading variant="display-strong-xl" marginBottom="l">
              Understand Legal Documents in{" "}
              <Text variant="display-strong-xl" onBackground="brand-strong">
                Seconds, Not Hours
              </Text>
            </Heading>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Text
              variant="heading-default-xl"
              onBackground="neutral-weak"
              wrap="balance"
              marginBottom="xl"
              style={{ maxWidth: "600px" }}
            >
              Search thousands of pre-analyzed companies and instantly understand their terms of service,
              privacy policies, and legal agreements. Plus, ask our AI assistant any follow-up questions.
            </Text>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Row gap="m" wrap horizontal="center" marginTop="l">
              {isSignedIn ? (
                <Button
                  size="l"
                  weight="strong"
                  prefixIcon="play"
                  arrowIcon
                  href="/companies"
                >
                  Go to App
                </Button>
              ) : (
                <>
                  <Button
                    size="l"
                    weight="strong"
                    prefixIcon="play"
                    arrowIcon
                    href="/companies"
                  >
                    Try Demo
                  </Button>
                  <SignInButton mode="modal">
                    <Button
                      size="l"
                      variant="secondary"
                      prefixIcon="users"
                    >
                      Sign In
                    </Button>
                  </SignInButton>
                </>
              )}
            </Row>
          </motion.div>

          {/* <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Row gap="m" horizontal="center" marginTop="l">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Trusted by 10,000+ users
              </Text>
              <Row gap="xs">
                {[1, 2, 3, 4, 5].map((i) => (
                  <FiStar key={i} size={16} color="#FFD700" fill="#FFD700" />
                ))}
              </Row>
              <Text variant="label-default-s" onBackground="neutral-weak">
                4.9/5 rating
              </Text>
            </Row>
          </motion.div> */}
        </Column>
      </Column>

      {/* Features Section */}
      <Column maxWidth="xl" padding="xl" horizontal="center">
        <Column gap="xl" paddingY="l">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Column horizontal="center" gap="l" align="center">
              <Heading variant="display-strong-l">Why Choose ToastAI?</Heading>
              <Text
                variant="heading-default-l"
                onBackground="neutral-weak"
                wrap="balance"
                style={{ maxWidth: "600px" }}
              >
                We make legal documents accessible to everyone through AI-powered analysis
              </Text>
            </Column>
          </motion.div>

          <Row gap="l" wrap horizontal="center">
            {[
              {
                icon: FiZap,
                title: "Instant Search",
                description: "Search thousands of companies and get instant legal document analysis in seconds",
                color: "brand-strong"
              },
              {
                icon: FiShield,
                title: "Pre-analyzed Database",
                description: "We've already analyzed legal documents from thousands of websites for you",
                color: "success-strong"
              },
              {
                icon: FiBookOpen,
                title: "AI Assistant",
                description: "Ask follow-up questions and get detailed explanations about any legal terms",
                color: "warning-strong"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                style={{ flex: "1", minWidth: "300px" }}
              >
                <Card padding="l">
                  <Column gap="m" align="center" horizontal="center">
                    <Icon name="rocket" size="xl" onBackground="brand-strong" marginBottom="s" />
                    <Heading variant="heading-strong-m">{feature.title}</Heading>
                    <Text variant="body-default-m" onBackground="neutral-weak">
                      {feature.description}
                    </Text>
                  </Column>
                </Card>
              </motion.div>
            ))}
          </Row>
        </Column>
      </Column>

      {/* How It Works Section */}
      <Column maxWidth="xl" padding="xl" horizontal="center">
        <Column gap="xl" paddingY="l">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Column horizontal="center" gap="l" align="center">
              <Heading variant="display-strong-l">How It Works</Heading>
              <Text
                variant="heading-default-l"
                onBackground="neutral-weak"
                wrap="balance"
                style={{ maxWidth: "600px" }}
              >
                We've done the heavy lifting - now you just search and ask questions
              </Text>
            </Column>
          </motion.div>

          <Row gap="xl" wrap horizontal="center">
            {[
              {
                step: "01",
                title: "We've Analyzed Everything",
                description: "Our AI has already scraped and analyzed legal documents from thousands of websites"
              },
              {
                step: "02",
                title: "Select a Company",
                description: "Search and select any company from our database to analyze their legal documents"
              },
              {
                step: "03",
                title: "Get Insights & Ask Questions",
                description: "Receive a clear summary and ask our AI assistant any follow-up questions"
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                style={{ flex: "1", minWidth: "250px" }}
              >
                <Column gap="m" align="center" horizontal="center">
                  <Badge
                    textVariant="heading-strong-s"
                    onBackground="brand-strong"
                    border="brand-strong"
                    padding="s"
                    marginBottom="m"
                  >
                    {step.step}
                  </Badge>
                  <Heading variant="heading-strong-m">{step.title}</Heading>
                  <Text variant="body-default-m" onBackground="neutral-weak">
                    {step.description}
                  </Text>
                </Column>
              </motion.div>
            ))}
          </Row>
        </Column>
      </Column>

      {/* Social Proof Section */}
      {/* <Column maxWidth="xl" padding="xl" horizontal="center">
        <Column gap="xl" paddingY="l">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Column horizontal="center" gap="l" align="center">
              <Heading variant="display-strong-l">Trusted by Legal Teams</Heading>
              <Text
                variant="heading-default-l"
                onBackground="neutral-weak"
                wrap="balance"
                style={{ maxWidth: "600px" }}
              >
                Join thousands of professionals who trust ToastAI for document analysis
              </Text>
            </Column>
          </motion.div>

          <Row gap="l" wrap horizontal="center">
            {[
              {
                quote: "ToastAI saved our team hours of work. What used to take days now takes minutes.",
                author: "Sarah Chen",
                role: "General Counsel",
                company: "TechFlow Inc."
              },
              {
                quote: "Finally, a tool that makes legal documents actually readable. Game changer for our startup.",
                author: "Marcus Rodriguez",
                role: "CEO",
                company: "StartupXYZ"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                style={{ flex: "1", minWidth: "400px" }}
              >
                <Card padding="l">
                  <Column gap="m">
                    <Row gap="xs">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <FiStar key={i} size={16} color="#FFD700" fill="#FFD700" />
                      ))}
                    </Row>
                    <Text variant="body-default-l" style={{ fontStyle: "italic" }}>
                      "{testimonial.quote}"
                    </Text>
                    <Column gap="xs">
                      <Text variant="label-strong-s">{testimonial.author}</Text>
                      <Text variant="label-default-s" onBackground="neutral-weak">
                        {testimonial.role} at {testimonial.company}
                      </Text>
                    </Column>
                  </Column>
                </Card>
              </motion.div>
            ))}
          </Row>
        </Column>
      </Column> */}

      {/* CTA Section */}
      <Column maxWidth="xl" padding="xl" horizontal="center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card padding="xl" horizontal="center">
            <Column gap="l" horizontal="center" style={{ maxWidth: "600px" }}>
              <Heading variant="display-strong-l">
                Ready to Search Thousands of Companies?
              </Heading>
              <Text
                variant="heading-default-l"
                onBackground="neutral-weak"
                wrap="balance"
              >
                Start searching companies for free. Get instant legal insights and ask our AI assistant questions.
              </Text>
              <Row gap="m" wrap horizontal="center">
                {isSignedIn ? (
                  <Button
                    size="l"
                    weight="strong"
                    prefixIcon="play"
                    arrowIcon
                    href="/companies"
                  >
                    Go to App
                  </Button>
                ) : (
                  <>
                    <Button
                      size="l"
                      weight="strong"
                      prefixIcon="play"
                      arrowIcon
                      href="/companies"
                    >
                      Try Free Demo
                    </Button>
                    <SignInButton mode="modal">
                      <Button
                        size="l"
                        variant="secondary"
                        prefixIcon="users"
                      >
                        Sign In
                      </Button>
                    </SignInButton>
                  </>
                )}
              </Row>
              <Text variant="label-default-s" onBackground="neutral-weak">
                Free tier includes 10 company searches per month
              </Text>
            </Column>
          </Card>
        </motion.div>
      </Column>
    </Column>
  );
}
