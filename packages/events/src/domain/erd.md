# Event domain ERD

This document contains the mermaid diagrams for the event domain model.

The schemas are generated from Zod definitions and provide a visual representation of the data structure.

## LetterVariant schema

```mermaid
erDiagram
    LetterVariant {
        string id
        string name
        string description
        string type "enum: STANDARD, BRAILLE, AUDIO, SAME_DAY"
        string status "enum: DRAFT, PUBLISHED, DISABLED"
        string clientId
        string[] campaignIds
        string[] packSpecificationIds
        Constraints constraints
    }
    Constraints {
        number maxSheets
        number deliverySLA
        number blackCoveragePercentage
        number colourCoveragePercentage
    }
    LetterVariant ||--o{ Constraints : "constraints"
```

## PackSpecification schema

```mermaid
erDiagram
    PackSpecification {
        string id
        string name
        string status "enum: DRAFT, PUBLISHED, DISABLED"
        string createdAt
        string updatedAt
        number version "min: -9007199254740991, max: 9007199254740991"
        string billingId
        Constraints constraints
        Postage postage
        Assembly assembly
    }
    Constraints {
        number maxSheets
        number deliverySLA
        number blackCoveragePercentage
        number colourCoveragePercentage
    }
    Postage {
        string id
        string tariff "enum: FIRST, SECOND, ECONOMY"
        string size "enum: STANDARD, LARGE"
        number deliverySLA
        number maxWeight
        number maxThickness
    }
    Assembly {
        string envelopeId
        string printColour "enum: BLACK, COLOUR"
        Paper paper
        string[] insertIds
        string[] features "enum: MAILMARK, BRAILLE, AUDIO, ADMAIL"
        Record additional "&lt;string, string&gt;"
    }
    Paper {
        string id
        string name
        number weightGSM
        string size "enum: A4, A3"
        string colour "enum: WHITE, COLOURED"
        boolean recycled
    }
    PackSpecification ||--o{ Constraints : "constraints"
    PackSpecification ||--|| Postage : "postage"
    PackSpecification ||--o{ Assembly : "assembly"
    Assembly ||--o{ Paper : "paper"
```
