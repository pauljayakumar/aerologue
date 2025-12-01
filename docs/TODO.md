# Aerologue - Future Tasks & Polish Items

Items to revisit when time permits.

---

## Design & Branding

- [ ] **Dark mode logo variant** - Create `Aerologue_Logo_Dark.png` with white text for proper dark mode display. Currently using CSS filter (`brightness-0 invert`) as workaround - loses the blue gradient on the plane icon.

---

## UI/UX

- [ ] Review all pages with new design system colors
- [ ] Mobile responsive testing
- [ ] Accessibility audit (color contrast, focus states)

---

## Technical Debt

- [ ] (Add items as they come up)

---

## AWS - Periodic Review Items

### SES Sandbox Mode Review
**Status:** 🟡 In Sandbox Mode
**Added:** December 1, 2025
**Review:** Before public launch or when need to send emails to unverified addresses

**Current Limitations:**
- Can only forward emails to verified addresses
- 200 emails/day sending limit
- 1 email/second rate limit

**Decision Criteria for Production Access:**
- [ ] Need to send transactional emails to users (password reset, notifications)
- [ ] Need to forward contact emails without verifying each recipient
- [ ] Launching publicly and expect external email communication

**How to Exit Sandbox:**
1. AWS Console → SES → Account Dashboard → "Request production access"
2. Describe use case: "Transactional emails for user registration, password reset, and contact form responses"
3. Wait 24-48 hours for approval

**Note:** For now, ensure samsonsamuel@live.co.uk is verified to receive forwarded emails.

---

*Last updated: December 1, 2025*
