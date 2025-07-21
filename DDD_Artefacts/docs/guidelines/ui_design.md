---
title: "Ubiquitous Language in UI Design"
version: "2.0"
last_updated: "2025-06-06"
status: "Final"
---
##

title: "Ubiquitous Language in UI Design"
version: "1.0"
last_updated: "2025-06-06"

## status: "Draft"

status: "Draft"
title: Ubiquitous Language in UI Design
version: "1.0"
status: active
owner: UI/UX Team, Domain Experts
last_updated: 2025-06-06

# Ubiquitous Language in UI Design

## Overview

This guide establishes principles and practices for ensuring that user interfaces consistently reflect the ubiquitous language of Elias Food Imports' domain model. A UI that accurately mirrors domain concepts strengthens the connection between business understanding and user experience, reducing translation errors and improving overall Product cohesion.

## Core Principles

1. **Domain-Driven Labeling**: UI elements should use terms directly from the ubiquitous language rather than technical or UI-specific jargon.
2. **Context-Aware Terminology**: UI language should respect bounded context boundaries and adapt terminology to the specific user journey context.
3. **Consistency Across Touchpoints**: The same domain concepts should be consistently represented across different interfaces and interaction points.
4. **User Role Alignment**: UI language should consider the user role (Customer, admin, warehouse staff) while maintaining fidelity to core domain concepts.
5. **Domain Event Visibility**: UI should surface important domain events in ways that reflect their significance in the domain model.
6. **Process Alignment**: Workflows and multi-step processes should map to domain processes and business rules.
7. **Validation Messaging**: Error and validation messages should communicate business rules using domain terminology.

## Implementation Guidelines

### Navigation and Information Architecture

- **Menu Structure**: Organize primary navigation around core bounded contexts and subdomains
- **Section Naming**: Use domain terms for section headings and page titles
- **Breadcrumbs**: Include domain context hierarchies in breadcrumb paths
- **Search Components**: Implement domain-specific search with filters mapped to domain attributes

### Form Design

- **Field Labels**: Use entity and attribute names from the domain model
- **Input Validation**: Implement value object validation rules with domain-aligned error messages
- **Field Grouping**: Group inputs according to entity boundaries and aggregate structures
- **Action Buttons**: Label buttons with domain commands (e.g., "Authenticate Product" not "Submit")

### Data Presentation

- **Table Headers**: Use entity attribute names from the domain model
- **Data Visualization**: Label charts and graphs with domain metrics and KPIs
- **State Indicators**: Use domain status values (e.g., Subscription statuses)
- **Empty States**: Provide domain context in empty state messages

### Domain Storytelling in UI

- **Onboarding Flows**: Introduce domain concepts during user onboarding
- **Contextual Help**: Provide domain knowledge in tooltips and help sections
- **Feature Announcements**: Frame new features in terms of domain capabilities
- **Notification Content**: Use domain event language in system notifications

## Example UI Patterns

### Product Authentication UI

**Domain-Aligned Example:**

```html
<section class="Authentication-container">
  <h1>Product Authentication</h1>
  <div class="Authentication-method-selector">
```

<h2>Select Authentication Method</h2>
<ul>
```
      <li>
        <input type="radio" id="qr-Authentication" name="Authentication-type" value="QR_CODE">
        <label for="qr-Authentication">QR Code Authentication</label>
      </li>
      <li>
        <input type="radio" id="nfc-Authentication" name="Authentication-type" value="NFC_TAG">
        <label for="nfc-Authentication">NFC Tag Authentication</label>
      </li>
      <li>
        <input type="radio" id="hologram-Authentication" name="Authentication-type" value="HOLOGRAM">
        <label for="hologram-Authentication">Holographic Seal Authentication</label>
      </li>
```
</ul>
```
  </div>
  <div class="Authentication-input">
```
<label for="Authentication-token">Authentication Token</label>
<input id="Authentication-token" type="text" placeholder="Scan or enter Authentication code">
<p class="help-text">The Authentication token is located on the Product packaging or embedded in the NFC tag.</p>
```
  </div>
  <button type="submit" class="primary-action">Authenticate Product</button>
</section>
```
**Domain-Misaligned Example (Avoid):**
```html
<section class="form-container">
  <h1>Verify Item</h1>
  <div class="option-selector">
```
<h2>Select Method</h2>
<ul>
```
      <li>
        <input type="radio" id="option-1" name="method" value="qr">
        <label for="option-1">QR Scan</label>
      </li>
      <li>
        <input type="radio" id="option-2" name="method" value="nfc">
        <label for="option-2">NFC Reader</label>
      </li>
      <li>
        <input type="radio" id="option-3" name="method" value="holo">
        <label for="option-3">Hologram Check</label>
      </li>
```
</ul>
```
  </div>
  <div class="input-group">
```
<label for="verification-code">Code</label>
<input id="verification-code" type="text" placeholder="Enter code">
<p class="helper">Enter the code from the package.</p>
```
  </div>
  <button type="submit" class="btn-submit">Submit</button>
</section>
```
### Subscription Management UI
**Domain-Aligned Example:**
```html
<section class="Subscription-details">
  <header>
```
<h1>Mediterranean Essentials Subscription</h1>
<span class="Subscription-status active">Active</span>
```
  </header>
  <div class="Subscription-summary">
```
<dl>
```
      <dt>Next Billing Date</dt>
      <dd>June 15, 2025</dd>
      <dt>Billing Frequency</dt>
      <dd>Monthly</dd>
      <dt>Next Delivery Date</dt>
      <dd>June 18, 2025</dd>
      <dt>Subscription Value</dt>
      <dd>$89.95 USD</dd>
```
</dl>
```
  </div>
  <section class="Subscription-actions">
```
<h2>Manage Subscription</h2>
<ul class="action-list">
```
      <li><button class="action-button">Pause Subscription</button></li>
      <li><button class="action-button">Change Billing Frequency</button></li>
      <li><button class="action-button">Modify Subscription Items</button></li>
      <li><button class="action-button secondary">Cancel Subscription</button></li>
```
</ul>
```
  </section>
  <section class="Subscription-items">
```
<h2>Subscription Items</h2>
<table>
```
      <thead>
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th>Unit Price</th>
          <th>Substitution Preference</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Premium Greek Olive Oil</td>
          <td>1</td>
          <td>$24.95</td>
          <td>Allow Similar Products</td>
        </tr>
        <tr>
          <td>Aged Balsamic Vinegar</td>
          <td>1</td>
          <td>$18.50</td>
          <td>No Substitutions</td>
        </tr>
      </tbody>
```
</table>
```
  </section>
</section>
```
## Context-Specific UI Adaptations
### Customer-Facing UI
Customer interfaces should prioritize clarity while maintaining domain accuracy:
- Use descriptive labels alongside domain terms when introducing concepts
- Provide contextual help for complex domain concepts
- Focus on the Customer's journey through the domain processes
Example:
```html
<div class="Product-Authentication-result success">
  <h2>Authentication Successful</h2>
  <p>This Product has been verified as authentic Elias Food Imports merchandise.</p>
  <div class="certificate-details">
```
<h3>Certificate of Authenticity</h3>
<dl>
```
      <dt>Product</dt>
      <dd>Kalamata Extra Virgin Olive Oil</dd>
      <dt>Authentication Method</dt>
      <dd>NFC Tag Authentication</dd>
      <dt>Production Batch</dt>
      <dd>2025-KL-0342</dd>
      <dt>Origin</dt>
      <dd>Kalamata, Greece</dd>
      <dt>Authenticated On</dt>
      <dd>June 6, 2025 at 2:45 PM</dd>
```
</dl>
<a href="/certificates/12345" class="view-certificate">View Full Certificate</a>
```
  </div>
</div>
```
### Administrative UI
Administrative interfaces can use more technical domain language but should maintain ubiquitous language consistency:
- Include domain metrics and KPIs in dashboards
- Organize workflow tools around domain processes
- Provide domain context for administrative actions
Example:
```html
<div class="Inventory-management">
  <header>
```
<h1>Inventory Dashboard</h1>
<div class="Inventory-metrics">
```
      <div class="metric">
        <span class="metric-value">98.7%</span>
        <span class="metric-label">Inventory Accuracy</span>
      </div>
      <div class="metric warning">
        <span class="metric-value">4</span>
        <span class="metric-label">Low Stock Alerts</span>
      </div>
      <div class="metric">
        <span class="metric-value">2</span>
        <span class="metric-label">Pending Quarantines</span>
      </div>
```
</div>
```
  </header>
  <section class="Inventory-actions">
```
<button class="action-button">Create Purchase Order</button>
<button class="action-button">Record Stock Receipt</button>
<button class="action-button">Initiate Quality Check</button>
<button class="action-button">Manage Quarantined Items</button>
```
  </section>
</div>
```
## Validation and Error Messaging
Error messages should communicate business rules using domain terminology:
```javascript
// Domain-aligned validation messages
const validationMessages = {
  Subscription: {
```
pauseDuration: "Subscription pause duration cannot exceed 90 days according to our terms.",
billingFrequency: "Selected billing frequency is not compatible with this Subscription plan.",
deliveryAddress: "The delivery address is outside our shipping zones for Subscription products."
```
  },
  Authentication: {
```
invalidToken: "The Authentication token does not match our records for this Product.",
expiredCertificate: "This Product's Authentication certificate has expired. Please contact Customer support.",
multipleScanAttempts: "Multiple Authentication attempts detected. This may indicate a counterfeit Product."
```
  }
};
```
## Iconography and Visual Language
Icons and visual elements should reinforce domain concepts:
- Use consistent iconography for domain status values
- Create visual hierarchy that reflects domain importance
- Develop visual cues for domain relationships
Example:
```css
/*Status indicators with domain-aligned naming*/
.Subscription-status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}
.Subscription-status.active {
  background-color: var(--color-success-bg);
  color: var(--color-success);
}
.Subscription-status.paused {
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
}
.Subscription-status.cancelled {
  background-color: var(--color-neutral-bg);
  color: var(--color-neutral);
}
.Subscription-status.pending {
  background-color: var(--color-info-bg);
  color: var(--color-info);
}
```
## Domain-Driven User Research
When conducting user research on UI designs, evaluate the alignment with ubiquitous language:
1. Test whether users understand domain terms as presented in the interface
2. Observe how users describe workflows and actions in their own words
3. Compare user mental models with the domain model
4. Identify opportunities to better align UI language with user understanding
5. Validate that technical implementation preserves domain concepts
## Review Checklist
Use this checklist to verify UI design alignment with ubiquitous language:
### Terminology Alignment
- [ ] UI element labels use domain terms from the ubiquitous language glossary
- [ ] Button actions match domain commands and operations
- [ ] Status indicators use the same terminology as domain states
- [ ] Form fields match entity and attribute names
- [ ] Error messages reflect business rules using domain language
### Structural Alignment
- [ ] UI organization reflects bounded context boundaries
- [ ] Related data is grouped according to aggregate structures
- [ ] Workflows match domain processes
- [ ] Filtering and sorting options align with domain attributes
- [ ] Dashboard metrics represent domain KPIs
### Contextual Consistency
- [ ] Consistent terminology across different screens in the same context
- [ ] Context transitions are clearly indicated when crossing context boundaries
- [ ] Terms with different meanings across contexts are properly disambiguated
- [ ] Integration points between contexts use appropriate translation
### User Experience Considerations
- [ ] Domain complexity is appropriately progressive (simple first, complexity on demand)
- [ ] Technical constraints don't override domain language needs
- [ ] Domain terminology is accessible to target user roles
- [ ] Help text educates users on domain concepts
## Governance and Evolution
### UI Language Review Process
1. **Regular Audits**: Conduct quarterly reviews of UI language against the current ubiquitous language glossary
2. **Change Management**:
   - When domain language evolves, UI language updates should be prioritized
   - Document UI language changes with clear transition plans
   - Provide user education for significant terminology changes
3. **Design System Integration**:
   - Maintain a domain-aligned component library
   - Document domain language usage in design system guidelines
   - Include ubiquitous language review in design critiques
### Stakeholder Collaboration
- Include domain experts in UI design reviews
- Have UI designers participate in domain modeling sessions
- Establish a shared vocabulary between Product, design, and development teams
- Create feedback mechanisms for identifying language inconsistencies
## Conclusion
A UI that faithfully represents the ubiquitous language creates a seamless experience that connects users to domain concepts. This alignment reduces cognitive load, improves user comprehension, strengthens brand consistency, and ultimately delivers better business outcomes by ensuring that what users see and interact with directly maps to the core domain model.
*This guide is part of the Elias Food Imports Ubiquitous Language Consistency Framework. Refer to the [Ubiquitous Language Guidelines](ubiquitous_language_guidelines.md) for overarching principles and the [Domain Terms and Requirements](./domain-terms-requirements.md) for terminology reference.*

---

⚑ Related

- [Domain Glossary](../glossary.md)
- [Ubiquitous Language Evolution Process](./ubiquitous_language_evolution.md)

↩ [Back to Framework TOC](../README.md)
