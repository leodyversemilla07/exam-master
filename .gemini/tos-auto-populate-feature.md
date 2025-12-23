# TOS Auto-Populate from Module PDF Feature

## Overview
This feature allows educators to automatically populate the Table of Specifications (TOS) generation form using AI-powered extraction from a module's already-uploaded PDF file. This eliminates redundant data entry and ensures consistency between module content and assessment planning.

## How It Works

### User Flow
1. **Navigate to TOS Creation**: Educator goes to "Create TOS" page
2. **Select Module**: Choose a module from the dropdown
3. **Auto-Fill Appears**: If the selected module has a PDF file, an "Auto-Fill from PDF" button appears
4. **Click to Extract**: Educator clicks the button
5. **AI Processing**: The system analyzes the PDF in the background (~10-30 seconds)
6. **Auto-Population**: All form fields are automatically filled with extracted data
7. **Review & Adjust**: Educator can review and modify the auto-populated data
8. **Submit**: Create the TOS as normal

### What Gets Auto-Populated
- ✅ **Learning Objectives** (5-15 objectives with codes and descriptions)
- ✅ **Total Items** (Recommended test item count: 20-100)
- ✅ **Cognitive Levels Distribution** (Bloom's Taxonomy breakdown)
  - Remembering
  - Understanding
  - Applying
  - Analyzing
  - Evaluating
  - Creating
- ✅ **Question Types Distribution**
  - Multiple Choice
  - True/False
  - Essay
  - Identification
- ✅ **Difficulty Level** (Easy, Medium, Hard, or Mixed)
- ✅ **Quarter** (If mentioned in the PDF)

## Implementation Architecture

### Backend Components

#### 1. `TosExtractorService` (NEW)
**Location**: `app/Services/AI/TosExtractorService.php`

**Purpose**: AI-powered extraction of TOS-specific data from module PDFs

**Key Methods**:
```php
extractFromModule(Module $module): array
```
- Takes a module with existing PDF
- Extracts text from stored PDF file
- Uses AI (Gemini/GPT) to analyze and structure data
- Returns TOS-ready data structure

**AI Prompt Strategy**:
- Analyzes educational content for learning objectives
- Identifies cognitive complexity levels
- Suggests balanced distributions
- Recommends appropriate assessment methods

#### 2. `ModuleController::extractTosFromModule()` (NEW)
**Location**: `app/Http/Controllers/ModuleController.php`

**Endpoint**: `POST /modules/{module}/extract-tos`

**Purpose**: API endpoint to trigger TOS extraction

**Flow**:
```
Request → Permission Check → Service Call → JSON Response
```

### Frontend Components

#### 1. TOS Create Form Enhancement
**Location**: `resources/js/pages/tos-generates/create.tsx`

**New State**:
```typescript
const [isExtracting, setIsExtracting] = useState(false);
const [selectedModule, setSelectedModule] = useState<Module | null>(null);
```

**New Function**:
```typescript
handleAutoFillFromPDF(): Promise<void>
```
- Calls API endpoint
- Handles loading states
- Populates all form fields
- Shows success/error toasts

**UI Addition**:
- "Auto-Fill from PDF" button with sparkle icon
- Only appears when module with PDF is selected
- Shows loading spinner during extraction
- Styled with primary colors for visibility

### Routes

**New Route**:
```php
Route::post('modules/{module}/extract-tos', [ModuleController::class, 'extractTosFromModule'])
    ->name('modules.extract-tos')
    ->middleware(['auth', 'verified', 'permission:create tos']);
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ User selects Module with PDF                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ "Auto-Fill from PDF" button appears                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼ (User clicks)
┌─────────────────────────────────────────────────────────────┐
│ Frontend: axios.post('/modules/{id}/extract-tos')           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: ModuleController::extractTosFromModule()           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ TosExtractorService extracts PDF text                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ AI analyzes content using structured schema                 │
│ (Gemini 2.0 Flash / GPT-4o-mini)                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Returns structured TOS data (JSON)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend auto-populates all form fields                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ User reviews, adjusts, and submits TOS                      │
└─────────────────────────────────────────────────────────────┘
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "error": null,
  "data": {
    "learning_objectives": [
      {
        "code": "M10-A1",
        "description": "Analyze quadratic equations using factoring"
      },
      // ... more objectives
    ],
    "cognitive_levels": {
      "remembering": 8,
      "understanding": 12,
      "applying": 15,
      "analyzing": 10,
      "evaluating": 3,
      "creating": 2
    },
    "question_types": {
      "multiple_choice": 35,
      "true_false": 10,
      "essay": 3,
      "identification": 2
    },
    "recommended_total_items": 50,
    "difficulty_level": "mixed",
    "suggested_quarter": "1st Quarter"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Could not extract text from PDF. The file may be image-based or corrupted.",
  "data": null
}
```

## User Experience Enhancements

### Loading States
- Button shows spinning loader icon
- Text changes to "Analyzing PDF..."
- Button is disabled during extraction

### Success Feedback
- ✅ Green toast notification
- Shows count of extracted objectives
- Form fields update smoothly

### Error Handling
- ❌ Red toast notification with specific error
- Form remains in previous state
- User can retry or fill manually

## Technical Considerations

### Performance
- **PDF Size Limit**: 10MB maximum
- **Text Extraction**: First 15,000 characters only
- **AI Timeout**: 60 seconds
- **Expected Duration**: 10-30 seconds

### AI Configuration
- **Development**: Gemini 2.0 Flash (faster, free tier)
- **Production**: GPT-4o-mini (more consistent)
- **Max Tokens**: 4,000 tokens for response

### Validation
- Ensures cognitive levels sum equals total items
- Ensures question types sum equals total items
- Validates all required fields are present

## Dependencies

### PHP Packages
- `echolabsdev/prism` - AI integration framework
- `smalot/pdfparser` - PDF text extraction

### NPM Packages
- `sonner` - Toast notification system
- `axios` - HTTP client
- `lucide-react` - Icons (Sparkles, Loader2)

## Permissions Required
- **User Permission**: `create tos`
- **Route Middleware**: `auth`, `verified`, `permission:create tos`

## Future Enhancements

### Potential Improvements
1. **Topic Extraction**: Auto-populate topics/content areas
2. **PDF Preview**: Show PDF preview while extracting
3. **Batch Processing**: Extract from multiple PDFs
4. **Export Template**: Generate blank TOS templates
5. **Smart Suggestions**: ML-based recommendations
6. **Version History**: Track auto-fill modifications

### Possible Extensions
- **Question Bank Integration**: Auto-link to existing questions
- **Curriculum Standards**: Map to standards automatically
- **Collaborative Review**: Multi-educator validation workflow

## Testing

### Manual Testing Steps
1. Create a module with a PDF file
2. Navigate to TOS creation page
3. Select the module
4. Verify button appears
5. Click "Auto-Fill from PDF"
6. Wait for extraction
7. Verify all fields populated correctly
8. Check distributions sum correctly
9. Test error cases (corrupted PDF, no PDF, etc.)

### Test Cases
- ✅ Module with valid PDF
- ✅ Module without PDF (no button)
- ✅ Image-based PDF (error handling)
- ✅ Corrupted PDF (error handling)
- ✅ Network error during extraction
- ✅ AI service timeout
- ✅ Invalid AI response structure

## Troubleshooting

### Common Issues

**Button doesn't appear**
- Check if module has `pdf_file` stored
- Verify module is properly selected

**Extraction fails**
- Check PDF file exists in storage
- Verify PDF is text-based (not scanned image)
- Check AI service credentials
- Review Laravel logs for errors

**Incorrect data extracted**
- Review PDF content quality
- Check AI prompt effectiveness
- Consider manual adjustment

**Toast notifications not showing**
- Verify Toaster component is rendered
- Check console for React errors

## Code Locations Summary

| Component | File Path |
|-----------|-----------|
| TOS Extractor Service | `app/Services/AI/TosExtractorService.php` |
| Module Controller | `app/Http/Controllers/ModuleController.php` |
| Routes | `routes/web.php` |
| TOS Create Form | `resources/js/pages/tos-generates/create.tsx` |
| App Setup (Toaster) | `resources/js/app.tsx` |

---

**Created**: December 23, 2024  
**Author**: AI Assistant  
**Status**: ✅ Implemented
