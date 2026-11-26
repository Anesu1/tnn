import {Box, Card, Heading, Stack, Text} from '@sanity/ui'

// "Start here": a plain-language guide at the top of the Studio sidebar, for whoever runs the
// newsroom day to day. Keep it in step with deskStructure.ts and the story form's tabs.

const SECTIONS: {title: string; steps: string[]}[] = [
  {
    title: 'Every morning',
    steps: [
      'Open “To review”. These are stories reporters have sent from the writer portal.',
      'Read each one. To publish it, click the green Publish button at the bottom. To send it back, go to the Review tab, choose “Changes requested”, write what to change, and leave it unpublished. The reporter sees your note.',
      'Check “Needs fixing” and fix anything listed there.',
    ],
  },
  {
    title: 'Publishing a story yourself',
    steps: [
      'Click “+” at the top left and choose Story. Fill in the Story tab: headline, reporter, summary, section, region and the story text.',
      'Add a photo in the Photo tab (at least 1200px wide) and describe it in a few words.',
      'Click Publish. It appears on the website within a minute or two.',
    ],
  },
  {
    title: 'Scheduling a story for later',
    steps: [
      'In the Publishing tab, set “Published at” to the future time (Harare time), then click Publish.',
      'It stays hidden until then. You can see it under “Scheduled”.',
    ],
  },
  {
    title: 'The homepage',
    steps: [
      'In a story’s Publishing tab, choose Lead story (the big one at the top) or Top story (beside it). Everything else appears in Latest news by itself.',
      'For breaking news, switch on “Breaking news” and choose when the label comes off.',
      '“Homepage now” shows what is currently on top.',
    ],
  },
  {
    title: 'Fixing a mistake',
    steps: [
      'Edit the story and click Publish again. For an important change, set “Last substantial update” in the Publishing tab.',
      'To take a story off the website, open the menu next to the Publish button and choose Unpublish.',
      'Every change is kept. Click the clock icon at the top right of a story to see and restore an earlier version.',
    ],
  },
  {
    title: 'Reporters',
    steps: [
      'Each reporter has a profile under “Reporters”. Add their photo, role and a short bio, which appear on their page on the website.',
      'To let someone send stories, switch on “Can sign in to the writer portal”, click the button to make an invite code, and send them the code with this link: thenarrativenetwork.org/write/join',
      'Switch it off to remove their access straight away. Their published stories stay up.',
    ],
  },
  {
    title: 'Watch TNN',
    steps: [
      'Under “Watch TNN”, add an Episode: paste the YouTube link, choose the programme, and add a short summary.',
    ],
  },
]

export function StartHere() {
  return (
    <Box padding={4} style={{maxWidth: 720}}>
      <Stack space={5}>
        <Stack space={3}>
          <Heading as="h1" size={3}>
            Start here
          </Heading>
          <Text muted size={2}>
            How to run the TNN website from this Studio. Nothing here needs technical knowledge.
          </Text>
        </Stack>
        {SECTIONS.map((section) => (
          <Card key={section.title} padding={4} radius={2} shadow={1}>
            <Stack space={4}>
              <Heading as="h2" size={1}>
                {section.title}
              </Heading>
              {section.steps.map((step, i) => (
                <Text key={i} size={2}>
                  {section.steps.length > 1 ? `${i + 1}. ` : ''}
                  {step}
                </Text>
              ))}
            </Stack>
          </Card>
        ))}
        <Text muted size={1}>
          Stuck? Nothing you do here breaks the website: every version is saved and can be restored.
        </Text>
      </Stack>
    </Box>
  )
}
