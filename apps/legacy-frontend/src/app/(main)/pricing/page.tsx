"use client";

import {
  Badge,
  Button,
  Card,
  Heading,
  LetterFx,
  Text
} from "@once-ui-system/core";
import { motion } from "motion/react";
import { FiCheck, FiStar } from "react-icons/fi";

export default function Pricing() {
  return (
    <div className="w-full" style={{ minHeight: "100vh" }}>
      {/* Hero Section */}
      <div className="max-w-screen-xl p-8 flex justify-center mx-auto">
        <div className="flex flex-col justify-center items-center gap-8 py-6">
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
              <FiStar size={16} />
              <Text marginX="4">
                <LetterFx trigger="instant">Simple, Transparent Pricing</LetterFx>
              </Text>
            </Badge>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Heading variant="display-strong-xl" marginBottom="l">
              Choose Your Plan
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
              Start free and upgrade when you need more. All plans include unlimited search and AI assistant questions.
            </Text>
          </motion.div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-screen-xl p-8 flex justify-center mx-auto">
        <div className="flex gap-6 flex-wrap justify-center">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            style={{ flex: "1", minWidth: "350px", maxWidth: "400px" }}
          >
            <Card padding="l">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <Badge
                    textVariant="label-strong-s"
                    onBackground="brand-strong"
                    border="brand-strong"
                    padding="s"
                    style={{ alignSelf: "flex-start" }}
                  >
                    FREE
                  </Badge>
                  <Heading variant="display-strong-l">Free</Heading>
                  <Text variant="heading-default-l" onBackground="neutral-weak">
                    Perfect for getting started
                  </Text>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-2 items-center">
                      <FiCheck size={20} color="#10B981" />
                      <Text variant="body-default-m">Access to 100 websites</Text>
                    </div>
                    <div className="flex gap-2 items-center">
                      <FiCheck size={20} color="#10B981" />
                      <Text variant="body-default-m">Unlimited search and questions</Text>
                    </div>
                    <div className="flex gap-2 items-center">
                      <FiCheck size={20} color="#10B981" />
                      <Text variant="body-default-m">Expert level details</Text>
                    </div>
                    <div className="flex gap-2 items-center">
                      <FiCheck size={20} color="#10B981" />
                      <Text variant="body-default-m">AI assistant support</Text>
                    </div>
                  </div>

                  <Button
                    size="l"
                    weight="strong"
                    href="/"
                    style={{ marginTop: "auto" }}
                  >
                    Get Started Free
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Premium Plan - Coming Soon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card padding="l" style={{ position: "relative" }}>
              {/* Coming Soon Badge */}
              <Badge
                textVariant="label-strong-s"
                onBackground="warning-strong"
                border="warning-strong"
                padding="s"
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  zIndex: 1
                }}
              >
                COMING SOON
              </Badge>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <Badge
                    textVariant="label-strong-s"
                    onBackground="accent-strong"
                    border="accent-strong"
                    padding="s"
                    style={{ alignSelf: "flex-start" }}
                  >
                    PREMIUM
                  </Badge>
                  <Heading variant="display-strong-l">Pro</Heading>
                  <Text variant="heading-default-l" onBackground="neutral-weak">
                    For power users and teams
                  </Text>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-2 items-center">
                      <FiCheck size={20} color="#10B981" />
                      <Text variant="body-default-m">Access to 1,000+ websites</Text>
                    </div>
                    <div className="flex gap-2 items-center">
                      <FiCheck size={20} color="#10B981" />
                      <Text variant="body-default-m">Unlimited search and questions</Text>
                    </div>
                    <div className="flex gap-2 items-center">
                      <FiCheck size={20} color="#10B981" />
                      <Text variant="body-default-m">Paste any link for custom analysis</Text>
                    </div>
                    <div className="flex gap-2 items-center">
                      <FiCheck size={20} color="#10B981" />
                      <Text variant="body-default-m">Expert level details</Text>
                    </div>
                    <div className="flex gap-2 items-center">
                      <FiCheck size={20} color="#10B981" />
                      <Text variant="body-default-m">Priority AI assistant support</Text>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <Button
                      size="l"
                      variant="secondary"
                      disabled
                      style={{ marginTop: "auto" }}
                    >
                      Coming Soon
                    </Button>

                    {/* Email Signup */}
                    <div className="flex flex-col gap-2">
                      <Text variant="label-default-s" onBackground="neutral-weak" align="center">
                        Get notified when available
                      </Text>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          placeholder="Enter your email"
                          style={{
                            flex: 1,
                            padding: "0.75rem",
                            border: "1px solid var(--neutral-alpha-medium)",
                            borderRadius: "0.5rem",
                            background: "var(--neutral-background-weak)",
                            color: "var(--neutral-on-background)",
                            fontSize: "0.875rem"
                          }}
                        />
                        <Button
                          size="m"
                          variant="secondary"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          Notify Me
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-screen-xl p-8 flex justify-center mx-auto">
        <div className="flex flex-col gap-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center items-center gap-6">
              <Heading variant="display-strong-l">Frequently Asked Questions</Heading>
            </div>
          </motion.div>

          <div className="flex flex-col gap-6">
            {[
              {
                question: "What websites are included in the free plan?",
                answer: "The free plan includes access to 100 of the most popular websites and companies. We're constantly adding more to our database."
              },
              {
                question: "Can I upgrade from free to pro later?",
                answer: "Absolutely! You can upgrade to the pro plan anytime. We'll notify you as soon as it's available."
              },
              {
                question: "What does 'unlimited search and questions' mean?",
                answer: "You can search our database as many times as you want and ask our AI assistant unlimited follow-up questions about any legal documents."
              },
              {
                question: "When will the pro plan be available?",
                answer: "We're working hard to launch the pro plan soon. Sign up for notifications to be the first to know when it's ready."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card padding="l">
                  <div className="flex flex-col gap-4">
                    <Heading variant="heading-strong-m">{faq.question}</Heading>
                    <Text variant="body-default-m" onBackground="neutral-weak">
                      {faq.answer}
                    </Text>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-screen-xl p-8 flex justify-center mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card padding="xl" horizontal="center">
            <div className="flex flex-col gap-6 justify-center items-center" style={{ maxWidth: "600px" }}>
              <Heading variant="display-strong-l">
                Ready to Get Started?
              </Heading>
              <Text
                variant="heading-default-l"
                onBackground="neutral-weak"
                wrap="balance"
              >
                Join thousands of users who are already understanding legal documents with ToastAI.
              </Text>
              <div className="flex gap-4 flex-wrap justify-center">
                <Button
                  size="l"
                  weight="strong"
                  href="/"
                >
                  Start Free Now
                </Button>
                <Button
                  size="l"
                  variant="secondary"
                  href="/"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
