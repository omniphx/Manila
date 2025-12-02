# Landing Page Mockup

This mockup demonstrates the unauthenticated/logged-out landing page for Manila.

## Design Intent

The landing page needs to accomplish three goals:
1. **Communicate value quickly** - Users should understand what Manila does within seconds
2. **Build trust** - Show a preview of the actual product to set expectations
3. **Drive conversion** - Make sign-up frictionless with prominent CTAs

## Key Design Decisions

### Hero Section
- **Tagline badge**: "Dropbox meets ChatGPT" immediately frames the product in familiar terms
- **Headline**: "Chat with your documents." is direct and action-oriented
- **Subheadline**: Explains the how without jargon (upload, ask, get answers)

### Chat Preview
- Shows a realistic conversation with user question and AI response
- Includes citation badges to demonstrate the unique value (answers with sources)
- Static preview rather than animated to reduce complexity and load time

### Feature Grid
- Three features that address the core workflow: Upload, Chat, Get Answers
- Each card has an icon, title, and brief description
- Uses brand purple (#6c47ff) for icon backgrounds to maintain visual consistency

### Trust Elements
- Security message at bottom: "Your documents are encrypted and private"
- This addresses a common concern with document-upload apps

### Layout Choices
- Single-column centered layout for focus
- Maximum width constraints (max-w-6xl, max-w-3xl) for readability
- Generous whitespace between sections

## Styling Patterns Used

- **Brand color**: `#6c47ff` for primary CTAs and accent elements
- **Rounded buttons**: `rounded-full` for primary CTAs per design requirements
- **Dark mode**: Full support using `dark:` variants
- **Typography**: Uses Geist font via existing CSS variables
- **Borders**: `border-zinc-200 dark:border-zinc-800` for subtle separation
- **Backgrounds**: `bg-zinc-50 dark:bg-black` for page, white/zinc-900 for cards

## Implementation Notes

When converting to production:
1. Replace static buttons with Clerk's `<SignInButton>` and `<SignUpButton>`
2. Consider adding a demo video or animated GIF in place of static chat preview
3. The header duplicates what's in the root layout for signed-out users; production version should coordinate with layout

## File Structure

```
landing/
  page.tsx    # Main component with all sections
  README.md   # This file
```
