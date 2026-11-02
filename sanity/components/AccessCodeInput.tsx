import {useState} from 'react'
import {set, type StringInputProps} from 'sanity'
import {Button, Card, Code, Stack, Text} from '@sanity/ui'

import {generateAccessCode, hashAccessCode} from '../lib/accessCode'

// Generates a writer's invite code, stores only its hash, and shows the code once.
// Writers redeem it at /write/join to choose their email and password.
export function AccessCodeInput(props: StringInputProps) {
  const {value, onChange, readOnly} = props
  const [code, setCode] = useState<string | null>(null)

  async function handleGenerate() {
    const next = generateAccessCode()
    onChange(set(await hashAccessCode(next)))
    setCode(next)
  }

  return (
    <Stack space={3}>
      {code ? (
        <Card padding={3} radius={2} tone="positive" border>
          <Stack space={3}>
            <Text size={1} weight="semibold">
              Copy this code and send it to the writer privately. It won&apos;t be shown again.
            </Text>
            <Code size={2}>{code}</Code>
            <Text size={1} muted>
              Publish this author, then they go to /write/join, enter the code and choose their email and password.
              The code works once.
            </Text>
          </Stack>
        </Card>
      ) : (
        <Text size={1} muted>
          {value
            ? 'An invite code has been generated. If the writer forgot their password, generate a new code: they use it at /write/join to set a new password.'
            : 'No invite code yet. Generate one and send it to the writer so they can set up their account.'}
        </Text>
      )}
      <Button
        text={value ? 'Generate new invite code' : 'Generate invite code'}
        tone={value ? 'caution' : 'primary'}
        mode={value ? 'ghost' : 'default'}
        onClick={handleGenerate}
        disabled={readOnly}
      />
    </Stack>
  )
}
