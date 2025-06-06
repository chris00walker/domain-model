# Ubiquitous Language Review Checklist

## Purpose

This checklist provides a structured approach for reviewing code, documentation, and other artifacts to ensure consistent use of the ubiquitous language. It can be used during code reviews, documentation reviews, and regular terminology audits to maintain alignment between the domain model and business concepts.

## Code Review Checklist

### Class and Interface Names

- [ ] Classes and interfaces use nouns that directly match glossary terms
- [ ] Aggregate names match their definitions in the glossary
- [ ] Repository interfaces follow the pattern `[Aggregate]Repository`
- [ ] Domain services follow the pattern `[Purpose]Service` or `[Domain]Service`
- [ ] Value objects represent immutable domain concepts with matching glossary terms
- [ ] Factories follow the pattern `[Entity]Factory`

### Method Names

- [ ] Methods use verb phrases that reflect business processes
- [ ] Command methods (that change state) use imperative verbs (e.g., `placeOrder()`)
- [ ] Query methods (that return data) use descriptive phrases (e.g., `activeSubscriptions()`)
- [ ] Boolean methods use `is`, `has`, or `can` prefixes (e.g., `isActive()`, `hasActiveSubscription()`)
- [ ] Method names accurately reflect their business purpose

### Domain Events

- [ ] Domain events use past tense to indicate completed state changes
- [ ] Event names match the glossary terminology
- [ ] Events carry all relevant domain information
- [ ] Events are properly documented with their business significance

### Variables and Parameters

- [ ] Variable names use domain terminology
- [ ] Collection variables use plural forms of domain terms
- [ ] Boolean variables use `is`, `has`, or similar prefixes
- [ ] Parameter names reflect their domain meaning

### Comments and Documentation

- [ ] Code comments use ubiquitous language terms
- [ ] Complex domain logic includes references to business rules
- [ ] Documentation strings explain the business purpose
- [ ] References to the glossary are included where appropriate

### Enumerations

- [ ] Enum types use singular nouns matching glossary terms
- [ ] Enum values match the terminology used by the business
- [ ] Enum values are properly documented with their business meaning

### Package and Directory Structure

- [ ] Top-level directories match bounded contexts
- [ ] Subdirectories group related domain concepts
- [ ] Package/directory names use ubiquitous language terms

## Documentation Review Checklist

### Technical Documentation

- [ ] Documentation begins with references to relevant glossary terms
- [ ] Domain terms are consistently capitalized and formatted
- [ ] Domain terms are highlighted in `code style` or **bold**
- [ ] Links to the glossary are included where appropriate
- [ ] Documentation is structured around bounded contexts and domain concepts
- [ ] Technical concepts are explained using business terminology

### Business Documentation

- [ ] Business requirements use the ubiquitous language
- [ ] Generic terms are replaced with specific domain terms
- [ ] A glossary reference is included
- [ ] Acceptance criteria use domain terminology
- [ ] Metrics and KPIs match the definitions in the glossary
- [ ] Use cases and scenarios use domain terminology consistently

### API Documentation

- [ ] Endpoint names use domain terminology
- [ ] Request and response fields use domain terminology
- [ ] Error messages use consistent domain terms
- [ ] API descriptions explain the business purpose
- [ ] Examples use realistic domain scenarios

### User Interface Text

- [ ] Labels use terms from the ubiquitous language
- [ ] Error messages use consistent terminology
- [ ] Help text explains concepts using domain terminology
- [ ] Navigation elements reflect domain concepts
- [ ] Form fields use domain terminology

## Database Review Checklist

- [ ] Table names reflect domain aggregates or entities
- [ ] Column names use domain terminology
- [ ] Join tables for many-to-many relationships use domain relationship names
- [ ] Constraints and rules reflect domain rules
- [ ] Stored procedures and functions use domain terminology
- [ ] Database comments and documentation use ubiquitous language

## Cross-Artifact Consistency Checklist

- [ ] Terms are used consistently across code, documentation, and database
- [ ] Business metrics are represented consistently in code and reporting
- [ ] Domain events have consistent names across publishers and subscribers
- [ ] API contracts align with internal domain model terminology
- [ ] User interface terminology matches the domain model
- [ ] Error messages use consistent terminology across all layers

## Bounded Context Boundary Checklist

- [ ] Terms that have different meanings in different contexts are clearly distinguished
- [ ] Context maps accurately document terminology translations
- [ ] Anti-corruption layers properly translate between contexts
- [ ] Shared kernels use consistent terminology
- [ ] Customer/supplier relationships have clear terminology contracts

## Terminology Evolution Checklist

- [ ] New terms have been properly documented in the glossary
- [ ] Term changes have been communicated to all team members
- [ ] Code has been updated to reflect terminology changes
- [ ] Documentation has been updated to reflect terminology changes
- [ ] Database schemas and queries have been updated if necessary
- [ ] Tests have been updated to use the current terminology

## Review Process

### Before the Review

1. Familiarize yourself with the [Enhanced Glossary](enhanced_glossary.md)
2. Review the [Ubiquitous Language Guidelines](ubiquitous_language_guidelines.md)
3. Understand the context of the changes being reviewed
4. Identify the relevant bounded contexts

### During the Review

1. Use this checklist to systematically evaluate the artifacts
2. Document any inconsistencies or issues found
3. Distinguish between critical terminology issues and minor inconsistencies
4. Provide constructive feedback with specific examples

### After the Review

1. Ensure all critical terminology issues are addressed
2. Update the glossary if new terms or clarifications are needed
3. Share lessons learned with the team
4. Suggest improvements to the ubiquitous language process if needed

## Example Review Comments

### Helpful Review Comments

✅ "The method name `deactivateUser()` should be changed to `deactivateCustomer()` to align with our ubiquitous language."

✅ "The term 'Order Item' is used in this code, but our glossary uses 'Line Item'. We should consistently use 'Line Item'."

✅ "This domain event is named `SubscriptionCanceled` but our convention is to use British English spelling: `SubscriptionCancelled`."

✅ "The variable `userType` should be renamed to `customerType` to match our domain terminology."

### Unhelpful Review Comments

❌ "This naming is wrong." (Too vague, doesn't reference the ubiquitous language)

❌ "I don't like this name." (Personal preference rather than alignment with ubiquitous language)

❌ "Change all the names in this file." (Too broad, doesn't specify which terms violate the ubiquitous language)

❌ "This should be more descriptive." (Doesn't reference specific domain terminology)

## Terminology Compliance Metrics

Consider tracking these metrics to measure terminology consistency:

1. **Terminology Compliance Rate**: Percentage of code elements that use approved terminology
2. **Glossary Coverage**: Percentage of domain terms that are documented in the glossary
3. **Terminology Debt**: Number of known terminology inconsistencies
4. **Terminology Change Adoption**: Time taken to fully adopt terminology changes

## Conclusion

Consistent use of the ubiquitous language is essential for maintaining alignment between the domain model and business concepts. This checklist provides a structured approach for reviewing code, documentation, and other artifacts to ensure terminology consistency.

Regular reviews using this checklist will help identify and address terminology inconsistencies, leading to clearer communication, better alignment with business concepts, and a more maintainable domain model.

---
*This checklist should be used during code reviews, documentation reviews, and regular terminology audits. Last updated: 2025-06-05*
