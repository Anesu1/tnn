import {useMemo, useState} from 'react'
import {Box, Button, Card, Flex, Heading, Stack, Text, TextInput} from '@sanity/ui'
import {SearchIcon} from '@sanity/icons'

import {findTopics, TOPICS, type Topic} from '../lib/helpTopics'

// "Ask the Studio": type a question in your own words and get the steps plus a button that opens
// the right place. The answers and matching are in sanity/lib/helpTopics.ts.

function TopicCard({topic}: {topic: Topic}) {
  return (
    <Card padding={4} radius={2} shadow={1}>
      <Stack space={4}>
        <Heading as="h3" size={1}>
          {topic.title}
        </Heading>
        {topic.steps.map((step, i) => (
          <Text key={i} size={2}>
            {topic.steps.length > 1 ? `${i + 1}. ` : ''}
            {step}
          </Text>
        ))}
        {topic.go && (
          <Flex>
            <Button as="a" href={topic.go.href} text={topic.go.label} tone="primary" mode="ghost" />
          </Flex>
        )}
      </Stack>
    </Card>
  )
}

export function HelpAssistant() {
  const [question, setQuestion] = useState('')
  const results = useMemo(() => findTopics(question), [question])

  return (
    <Stack space={4}>
      <Stack space={3}>
        <Heading as="h2" size={2}>
          Ask the Studio
        </Heading>
        <Text muted size={2}>
          Type what you want to do, in your own words, e.g. “schedule a story”, “make it the lead story”, “send it back to the writer”.
        </Text>
      </Stack>
      <TextInput
        icon={SearchIcon}
        fontSize={2}
        padding={3}
        placeholder="How do I…"
        value={question}
        onChange={(event) => setQuestion(event.currentTarget.value)}
        aria-label="What do you want to do?"
      />
      {results && results.length > 0 && results.map((topic) => <TopicCard key={topic.title} topic={topic} />)}
      {results && results.length === 0 && (
        <Card padding={4} radius={2} tone="caution">
          <Text size={2}>Nothing matched. Try other words (“photo”, “schedule”, “homepage”, “writer”), or pick from the list below.</Text>
        </Card>
      )}
      {!results && (
        <Box>
          <Text size={1} muted>
            Or pick one:
          </Text>
          <Flex wrap="wrap" gap={2} marginTop={3}>
            {TOPICS.map((topic) => (
              <Button key={topic.title} text={topic.title} mode="ghost" fontSize={1} padding={2} onClick={() => setQuestion(topic.title)} />
            ))}
          </Flex>
        </Box>
      )}
    </Stack>
  )
}
