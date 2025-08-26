"use client"

import { Section, SectionTitle, SectionTitleProps } from "components/section"

import {
  Box,
  Circle,
  Heading,
  Icon,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react"

function Revealer({ children }: any) {
  return children
}

export interface FeaturesProps extends Omit<SectionTitleProps, "title"> {
  id?: string
  title?: React.ReactNode
  description?: React.ReactNode
  features: Array<FeatureProps>
  columns?: number | number[]
  spacing?: string | number
  aside?: React.ReactNode
  reveal?: React.FC<any>
  iconSize?: number
  innerWidth?: string
}

export interface FeatureProps {
  title?: React.ReactNode
  description?: React.ReactNode
  icon?: any
  iconPosition?: "left" | "top"
  iconSize?: number
  ip?: "left" | "top"
  variant?: string
  delay?: number
}

export function Feature(props: FeatureProps) {
  const { title, description, icon, iconPosition, iconSize = 8, ip } = props

  const pos = iconPosition || ip
  const direction = pos === "left" ? "row" : "column"

  return (
    <Stack direction={direction} gap={4}>
      {icon && (
        <Circle size="12" bg="blue.500" color="white">
          <Icon as={icon} boxSize={iconSize} />
        </Circle>
      )}
      <Box>
        <Heading size="md" mb={2}>
          {title}
        </Heading>
        <Text color="gray.600">{description}</Text>
      </Box>
    </Stack>
  )
}

export function Features(props: FeaturesProps) {
  const {
    title,
    description,
    features,
    columns = [1, 2, 3],
    spacing = 8,
    align: alignProp = "center",
    iconSize = 8,
    aside,
    reveal: Wrap = Revealer,
    ...rest
  } = props

  const align = !!aside ? "left" : alignProp

  const ip = align === "left" ? "left" : "top"

  return (
    <Section {...rest}>
      <Stack direction="row" height="full" align="flex-start">
        <VStack flex="1" gap={[4, null, 8]} alignItems="stretch">
          {(title || description) && (
            <Wrap>
              <SectionTitle
                title={title}
                description={description}
                align={align}
              />
            </Wrap>
          )}
          <SimpleGrid columns={columns} gap={spacing}>
            {features.map((feature, i) => {
              return (
                <Wrap key={i} delay={feature.delay}>
                  <Feature iconSize={iconSize} {...feature} ip={ip} />
                </Wrap>
              )
            })}
          </SimpleGrid>
        </VStack>
        {aside && (
          <Box flex="1" p="8">
            {aside}
          </Box>
        )}
      </Stack>
    </Section>
  )
}
