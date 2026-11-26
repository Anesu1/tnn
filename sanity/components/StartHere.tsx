import {Box, Card, Heading, Stack, Text} from '@sanity/ui'

import {HelpAssistant} from './HelpAssistant'

// "How to use the Studio": a plain-language guide at the bottom of the Studio sidebar.
// Keep it in step with deskStructure.ts and the field names in newsItemType.ts.

const SECTIONS: {title: string; steps: string[]}[] = [
  {
    title: 'Every morning',
    steps: [
      'Open “Awaiting approval”. These are stories writers have sent from the writer portal.',
      'Read each one. To publish it, click Publish at the bottom. To send it back, scroll to “Editor review”, choose “Changes requested”, write what to change, and leave it unpublished. The writer gets your note by email.',
      'Check “Needs attention” and “Photos to improve”.',
    ],
  },
  {
    title: 'Publishing a story yourself',
    steps: [
      'Click “+” at the top left and choose News. Fill in the title, author, main image (with its description and caption), summary, sections, region and content.',
      'Click Publish. It appears on the website within a minute or two. The slug (web address) is filled in from the title if you leave it empty.',
    ],
  },
  {
    title: 'Scheduling a story',
    steps: ['Set “Published at” to the future time (Harare time), then click Publish. It stays hidden until then and shows under “Scheduled”.'],
  },
  {
    title: 'The homepage',
    steps: [
      'Under “Homepage placement” in the story, choose Lead story (the big one at the top) or Top story (beside it). Everything else appears in Latest news by itself.',
      'For breaking news, switch on “Breaking news” and choose when the label comes off. “Homepage” in the sidebar shows what is on top now.',
    ],
  },
  {
    title: 'Fixing a mistake',
    steps: [
      'Edit the story and click Publish again. For an important change, set “Last substantial update”.',
      'To take a story off the website, open the menu next to Publish and choose Unpublish.',
      'Every change is kept: the clock icon at the top right of a story shows earlier versions you can restore.',
    ],
  },
  {
    title: 'Writers',
    steps: [
      'Under People, open the author and switch on “Can sign in to the writer portal”, make an invite code, and send it with this link: thenarrativenetwork.org/write/join',
      'Switch it off to remove their access straight away. Their published stories stay up.',
    ],
  },
]

export function StartHere() {
  return (
    <Box padding={4} style={{maxWidth: 720, margin: '0 auto'}}>
      <Stack space={5}>
        <HelpAssistant />
        <Stack space={3}>
          <Heading as="h1" size={3}>
            How to use the Studio
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
