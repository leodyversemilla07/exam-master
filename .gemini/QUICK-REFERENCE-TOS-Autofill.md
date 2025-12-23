# TOS Auto-Populate Feature - Quick Reference

## ✨ Feature Summary

**Automatically populate TOS forms from module PDFs using AI**

### What You Get
- 🎯 **Learning Objectives** extracted automatically
- 📊 **Cognitive Levels** distribution (Bloom's Taxonomy)
- 📝 **Question Types** recommendations
- ⚖️ **Difficulty Level** suggestions
- 🔢 **Total Items** recommendation

---

## 🚀 How to Use

### Step-by-Step
1. **Go to TOS → Create New TOS**
2. **Select a Module** from dropdown
3. **Look for "Auto-Fill from PDF" button** ✨
   - Only appears if module has PDF uploaded
4. **Click the button**
5. **Wait 10-30 seconds** while AI analyzes
6. **Review auto-populated fields**
7. **Adjust if needed**
8. **Submit!**

---

## 🎨 UI Preview

```
┌─────────────────────────────────────────────────┐
│ Basic Information                               │
├─────────────────────────────────────────────────┤
│ Module *                                        │
│ ┌─────────────────────────────────────────┐   │
│ │ MATH-101 - Algebra Fundamentals        ▼│   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ ✨ Auto-Fill from PDF                   │   │ ← NEW!
│ └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**While Loading:**
```
┌─────────────────────────────────────────┐
│ ⏳ Analyzing PDF...                    │
└─────────────────────────────────────────┘
```

---

## 💡 Example Output

**Before** (Empty Form):
```
Learning Objectives: [Empty]
Total Items: 50
Cognitive Levels: 0, 0, 0, 0, 0, 0
Question Types: 0, 0, 0, 0
```

**After** (Auto-Filled):
```
Learning Objectives:
  • MATH-10-1: Solve quadratic equations using factoring
  • MATH-10-2: Graph quadratic functions and identify key features
  • MATH-10-3: Apply quadratic formula to real-world problems
  ... (10 more objectives)

Total Items: 50

Cognitive Levels:
  Remembering: 8 items
  Understanding: 12 items
  Applying: 15 items
  Analyzing: 10 items
  Evaluating: 3 items
  Creating: 2 items

Question Types:
  Multiple Choice: 35
  True/False: 10
  Essay: 3
  Identification: 2

Difficulty: Mixed
Quarter: 1st Quarter
```

---

## ⚠️ Requirements

### For Auto-Fill to Work:
- ✅ Module must have PDF file uploaded
- ✅ PDF must be text-based (not scanned image)
- ✅ User needs "create tos" permission
- ✅ Internet connection for AI processing

### File Limits:
- 📄 **Max Size**: 10MB
- 📝 **Text Limit**: First 15,000 characters analyzed

---

## 🎯 Success Indicators

### ✅ Everything Worked:
- Green toast: "Successfully extracted TOS data from PDF!"
- All fields populated
- Numbers add up correctly

### ❌ Something Went Wrong:
- Red toast with error message
- Form stays empty
- Try again or fill manually

---

## 🔧 Common Issues

| Problem | Solution |
|---------|----------|
| No button appears | Module doesn't have PDF - upload one first |
| "Could not extract text" | PDF is image-based - use manual entry |
| Numbers don't add up | Review and adjust manually |
| Takes too long | Wait up to 60 seconds, then retry |

---

## 🛠️ Technical Details

**Backend:**
- Service: `TosExtractorService`
- Endpoint: `POST /modules/{id}/extract-tos`
- AI: Gemini 2.0 Flash (dev) / GPT-4o-mini (prod)

**Frontend:**
- Component: `tos-generates/create.tsx`
- State: `isExtracting`, `selectedModule`
- Notifications: Sonner toasts

---

## 📊 Example API Response

```json
{
  "success": true,
  "data": {
    "learning_objectives": [...],
    "cognitive_levels": {
      "remembering": 8,
      "understanding": 12,
      "applying": 15,
      "analyzing": 10,
      "evaluating": 3,
      "creating": 2
    },
    "recommended_total_items": 50,
    "difficulty_level": "mixed"
  }
}
```

---

## 🎓 Pro Tips

1. **Better PDFs = Better Results**
   - Use well-structured course materials
   - Include clear learning objectives
   - Mention cognitive levels if possible

2. **Always Review**
   - AI is smart but not perfect
   - Verify distributions match your needs
   - Adjust objectives for clarity

3. **Save Time**
   - Use for initial setup
   - Fine-tune manually
   - Reuse across similar modules

---

**Need Help?** Check the full documentation in `.gemini/tos-auto-populate-feature.md`
