# Frontend Mockup Implementation Plan

## Overview

This plan documents the gaps between the UI mockups and the current frontend implementation for the Manila document chat application. The mockups define the intended user experience for a "Dropbox meets ChatGPT" product, while the current implementation is in an early MVP stage.

## Mockups Summary

The mockups directory contains **8 distinct UI designs**:

| Mockup | Description | Key Features |
|--------|-------------|--------------|
| **Landing Page** | Unauthenticated homepage | Hero section, feature cards, chat preview, CTAs |
| **Chat Main** | Primary chat interface | Collapsible sidebar, document citations, recent files |
| **Chat (Simple)** | Focused chat view | Message bubbles, timestamps, typing indicator |
| **Chat with Upload** | Upload flow in chat | Drag-drop overlay, progress indicators, file processing status |
| **File Browser** | Full file management | Folder tree, grid/list views, breadcrumbs, file actions |
| **Account Settings** | User profile/settings | Profile section, notifications, appearance, connected accounts, danger zone |
| **404 Not Found** | Page not found | Large 404 display with gradient, friendly messaging |
| **Error Page** | General error page | Collapsible technical details, retry options |
| **Backend Status** | Dev-only indicator | Floating badge, connection status, expandable details |

## Current Implementation Summary

The current implementation includes:

| Page/Component | Status | Notes |
|----------------|--------|-------|
| **Home (`/`)** | Basic | Development landing page, not production-ready |
| **Chat (`/chat`)** | Implemented | Matches chat-main mockup closely |
| **Files (`/files`)** | Implemented | Matches file-browser mockup closely |
| **Account (`/account`)** | Implemented | Matches account mockup closely |
| **404 Not Found** | Implemented | Basic version, missing gradient effects |
| **Error Page** | Implemented | Basic version, missing collapsible details |
| **BackendStatus** | Implemented | Inline card style, not floating badge |
| **FileUpload** | Implemented | Basic form, missing drag-drop |
| **FileList** | Implemented | Basic list, missing grid view |

## GitHub Issues

| Issue | Title | Priority | Status |
|-------|-------|----------|--------|
| [#1](https://github.com/omniphx/Manila/issues/1) | Implement landing page hero section | High | Todo |
| [#2](https://github.com/omniphx/Manila/issues/2) | Add landing page feature cards component | High | Todo |
| [#3](https://github.com/omniphx/Manila/issues/3) | Create chat preview component for landing page | High | Todo |
| [#4](https://github.com/omniphx/Manila/issues/4) | Add footer component for landing page | High | Todo |
| [#5](https://github.com/omniphx/Manila/issues/5) | Implement authenticated user redirect from landing page | High | Todo |
| [#6](https://github.com/omniphx/Manila/issues/6) | Implement drag-and-drop file upload overlay | Medium | Todo |
| [#7](https://github.com/omniphx/Manila/issues/7) | Add upload progress indicators in chat | Medium | Todo |
| [#8](https://github.com/omniphx/Manila/issues/8) | Add file processing status messages | Medium | Todo |
| [#9](https://github.com/omniphx/Manila/issues/9) | Implement pending file chips UI | Medium | Todo |
| [#10](https://github.com/omniphx/Manila/issues/10) | Implement real-time chat message sending | Medium | Todo |
| [#11](https://github.com/omniphx/Manila/issues/11) | Add typing indicator animation | Medium | Todo |
| [#12](https://github.com/omniphx/Manila/issues/12) | Add message timestamps to chat | Medium | Todo |
| [#13](https://github.com/omniphx/Manila/issues/13) | Implement chat history persistence | Medium | Todo |
| [#14](https://github.com/omniphx/Manila/issues/14) | Enhance error page with collapsible technical details | Low | Todo |
| [#15](https://github.com/omniphx/Manila/issues/15) | Enhance 404 page with gradient styling | Low | Todo |
| [#16](https://github.com/omniphx/Manila/issues/16) | Convert BackendStatus to floating indicator | Low | Todo |
| [#17](https://github.com/omniphx/Manila/issues/17) | Implement dark mode theme switching | Low | Todo |
| [#18](https://github.com/omniphx/Manila/issues/18) | Implement compact view option | Low | Todo |
| [#19](https://github.com/omniphx/Manila/issues/19) | Add trust and security section to landing page | High | Todo |
| [#20](https://github.com/omniphx/Manila/issues/20) | Persist user preferences to database | Low | Todo |

## Identified Gaps

### 1. Landing Page (High Priority)

**Current State**: The home page (`/`) is a basic development page showing Next.js logo, backend status, and file upload form. It does not serve as a marketing landing page.

**Mockup Vision**: A polished landing page with:
- Hero section with "Dropbox meets ChatGPT" tagline
- Feature cards highlighting key benefits
- Interactive chat preview component
- Clear CTAs for sign up/sign in
- Trust/security messaging
- Professional footer

**Gap**: Complete redesign needed for unauthenticated users.

**Issues**: [#1](https://github.com/omniphx/Manila/issues/1), [#2](https://github.com/omniphx/Manila/issues/2), [#3](https://github.com/omniphx/Manila/issues/3), [#4](https://github.com/omniphx/Manila/issues/4), [#5](https://github.com/omniphx/Manila/issues/5), [#19](https://github.com/omniphx/Manila/issues/19)

---

### 2. Drag-and-Drop File Upload (Medium Priority)

**Current State**: Basic file input with form submission. No drag-drop support.

**Mockup Vision** (chat-with-upload):
- Full-screen drag overlay when files dragged over window
- Inline upload progress messages in chat
- File processing status with spinner animations
- Pending file chips before sending
- Support for multiple simultaneous uploads

**Gap**: Drag-drop functionality, progress indicators, and processing status UI missing.

**Issues**: [#6](https://github.com/omniphx/Manila/issues/6), [#7](https://github.com/omniphx/Manila/issues/7), [#8](https://github.com/omniphx/Manila/issues/8), [#9](https://github.com/omniphx/Manila/issues/9)

---

### 3. Backend Status Floating Indicator (Low Priority)

**Current State**: Inline card component embedded in home page.

**Mockup Vision**:
- Floating badge in bottom-right corner
- Color-coded status (green/yellow/red)
- Click to expand detailed information
- Retry connection button when disconnected

**Gap**: Needs to be converted to floating/fixed position component.

**Issues**: [#16](https://github.com/omniphx/Manila/issues/16)

---

### 4. Error Page Enhancements (Low Priority)

**Current State**: Basic error page with error ID display and retry button.

**Mockup Vision**:
- Amber-colored icon (less alarming)
- Collapsible technical details section
- Error code, request ID, timestamp, stack trace
- "Copy error details" functionality
- Contact support link

**Gap**: Missing collapsible details and copy functionality.

**Issues**: [#14](https://github.com/omniphx/Manila/issues/14)

---

### 5. 404 Page Enhancements (Low Priority)

**Current State**: Basic 404 with icon and navigation links.

**Mockup Vision**:
- Large gradient "404" text with purple accent
- Background glow effect
- "Go back to previous page" link

**Gap**: Missing gradient text effect and glow styling.

**Issues**: [#15](https://github.com/omniphx/Manila/issues/15)

---

### 6. Chat Input Enhancements (Medium Priority)

**Current State**: Basic textarea with send button.

**Mockup Vision** (chat-main, chat, chat-with-upload):
- Auto-expanding textarea with min/max height
- Keyboard shortcut hints (Enter to send, Shift+Enter for newline)
- File attachment button integration
- Typing indicator animation
- Message timestamps

**Gap**: Chat functionality is mostly visual mockup; real message sending not implemented.

**Issues**: [#10](https://github.com/omniphx/Manila/issues/10), [#11](https://github.com/omniphx/Manila/issues/11), [#12](https://github.com/omniphx/Manila/issues/12), [#13](https://github.com/omniphx/Manila/issues/13)

---

### 7. File Processing Indicators (Medium Priority)

**Current State**: Basic status badges (Pending, Processing, Completed, Failed).

**Mockup Vision**:
- Spinner animation for processing state
- "Processing... Extracting data from X sheets" detailed messages
- Page count after processing complete

**Gap**: More detailed processing feedback missing.

**Issues**: [#8](https://github.com/omniphx/Manila/issues/8)

---

### 8. Connected Accounts OAuth Integration (Low Priority)

**Current State**: Mock data for connected accounts (Google, GitHub, Dropbox).

**Mockup Vision**:
- Real OAuth integration with Clerk
- Connect/Disconnect functionality
- Display connected email

**Gap**: All connected accounts are mocked; no real integration.

**Issues**: Future work - not yet created

---

### 9. Appearance Settings (Dark Mode) (Low Priority)

**Current State**: Toggle exists but does not persist or apply globally.

**Mockup Vision**:
- Dark mode toggle that actually changes the theme
- Compact view option
- Persisted in user preferences

**Gap**: Theme switching not implemented.

**Issues**: [#17](https://github.com/omniphx/Manila/issues/17), [#18](https://github.com/omniphx/Manila/issues/18), [#20](https://github.com/omniphx/Manila/issues/20)

---

## Implementation Roadmap

### Phase 1: Landing Page (Priority: High)
Transform the home page into a marketing landing page for unauthenticated users.

| Issue | Title | Priority |
|-------|-------|----------|
| [#1](https://github.com/omniphx/Manila/issues/1) | Implement landing page hero section | High |
| [#2](https://github.com/omniphx/Manila/issues/2) | Add landing page feature cards component | High |
| [#3](https://github.com/omniphx/Manila/issues/3) | Create chat preview component for landing page | High |
| [#4](https://github.com/omniphx/Manila/issues/4) | Add footer component for landing page | High |
| [#19](https://github.com/omniphx/Manila/issues/19) | Add trust and security section to landing page | High |
| [#5](https://github.com/omniphx/Manila/issues/5) | Implement authenticated user redirect from landing page | High |

### Phase 2: File Upload UX (Priority: Medium)
Enhance file upload experience with drag-drop and progress indicators.

| Issue | Title | Priority |
|-------|-------|----------|
| [#6](https://github.com/omniphx/Manila/issues/6) | Implement drag-and-drop file upload overlay | Medium |
| [#7](https://github.com/omniphx/Manila/issues/7) | Add upload progress indicators in chat | Medium |
| [#8](https://github.com/omniphx/Manila/issues/8) | Add file processing status messages | Medium |
| [#9](https://github.com/omniphx/Manila/issues/9) | Implement pending file chips UI | Medium |

### Phase 3: Chat Functionality (Priority: Medium)
Enable real chat interactions with the backend.

| Issue | Title | Priority |
|-------|-------|----------|
| [#10](https://github.com/omniphx/Manila/issues/10) | Implement real-time chat message sending | Medium |
| [#11](https://github.com/omniphx/Manila/issues/11) | Add typing indicator animation | Medium |
| [#12](https://github.com/omniphx/Manila/issues/12) | Add message timestamps to chat | Medium |
| [#13](https://github.com/omniphx/Manila/issues/13) | Implement chat history persistence | Medium |

### Phase 4: Error Handling UX (Priority: Low)
Improve error and 404 pages.

| Issue | Title | Priority |
|-------|-------|----------|
| [#14](https://github.com/omniphx/Manila/issues/14) | Enhance error page with collapsible technical details | Low |
| [#15](https://github.com/omniphx/Manila/issues/15) | Enhance 404 page with gradient styling | Low |

### Phase 5: Developer Experience (Priority: Low)
Improve dev-only tooling.

| Issue | Title | Priority |
|-------|-------|----------|
| [#16](https://github.com/omniphx/Manila/issues/16) | Convert BackendStatus to floating indicator | Low |

### Phase 6: Settings & Preferences (Priority: Low)
Implement user preferences.

| Issue | Title | Priority |
|-------|-------|----------|
| [#17](https://github.com/omniphx/Manila/issues/17) | Implement dark mode theme switching | Low |
| [#18](https://github.com/omniphx/Manila/issues/18) | Implement compact view option | Low |
| [#20](https://github.com/omniphx/Manila/issues/20) | Persist user preferences to database | Low |

## Dependencies

- **Backend API**: Chat functionality requires backend endpoints for message handling
- **Clerk**: Connected accounts OAuth requires Clerk configuration
- **File Processing**: Processing status messages depend on backend file processing pipeline

## Open Questions

1. Should the landing page redirect authenticated users to `/chat` automatically?
2. What file types should be supported for drag-drop upload?
3. Should chat history be persisted across sessions?
4. What OAuth providers should be prioritized for connected accounts?
5. Should dark mode follow system preference by default?

## Design System Reference

From mockups page:
- **Primary accent**: `#6c47ff`
- **Font**: Geist Sans
- **Neutral palette**: Zinc
- **Rounded corners**: `rounded-lg` (cards), `rounded-full` (buttons)
- **Dark mode**: Supported via Tailwind `dark:` prefix
