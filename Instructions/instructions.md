# AI Personal Learning Assistant - Product Requirements Document

## 1. Product Overview

### 1.1 Purpose
The AI Personal Learning Assistant is a web application designed to help users create, organize, and share summaries of various content types (articles, videos, blog posts, documents). It serves as a personal knowledge repository with automated summarization capabilities.

### 1.2 Core Technologies
- Frontend: Next.js 14, Shadcn, Tailwind CSS, Lucide icons
- AI Integration: OpenAI GPT-4, LangChain
- Content Processing: YouTube Transcript API, Whisper for audio processing
- Browser Integration: Chrome Extension

## 2. Technical Architecture

### 2.1 File Structure

```markdown
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx        # Login page
│   │   ├── register/page.tsx     # Registration + initial preferences
│   │   └── layout.tsx            # Auth layout wrapper
│   ├── dashboard/
│   │   ├── page.tsx              # Main dashboard (recent summaries)
│   │   ├── [theme]/page.tsx      # Theme-specific summaries
│   │   └── [medium]/page.tsx     # Medium-specific summaries
│   ├── summary/
│   │   ├── [id]/page.tsx         # Individual summary page
│   │   └── create/page.tsx       # Manual summary creation
│   ├── settings/
│   │   └── page.tsx              # User preferences & settings
│   ├── search/
│   │   └── page.tsx              # Search interface
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/
│   ├── ui/                       # Shadcn components
│   ├── layout/
│   │   ├── Header.tsx            # Main navigation
│   │   ├── Sidebar.tsx          # Theme/medium navigation
│   │   └── SummaryCard.tsx      # Reusable summary display
│   ├── summary/
│   │   ├── SummaryForm.tsx      # Summary creation/edit form
│   │   ├── ThemeSelector.tsx    # Theme selection component
│   │   └── SharingOptions.tsx   # Sharing interface
│   └── browser/
│       └── Extension.tsx        # Browser extension popup
├── lib/
│   ├── api/
│   │   ├── openai.ts           # OpenAI client setup
│   │   └── youtube.ts          # YouTube API integration
│   ├── utils/
│   │   ├── summarize.ts        # Summary generation logic
│   │   ├── themeDetection.ts   # Auto theme detection
│   │   └── contentExtractor.ts # Content extraction from URLs
│   ├── types/
│   │   ├── summary.ts          # Summary-related types
│   │   ├── user.ts            # User-related types
│   │   └── theme.ts           # Theme-related types
│   └── db/
│       └── schema.ts          # Database schema definitions
├── hooks/
│   ├── useSummary.ts         # Summary management hook
│   ├── useThemes.ts         # Theme management hook
│   └── useSearch.ts        # Search functionality hook
└── styles/
    └── globals.css         # Global styles
```

### 2.2 Core Types and Interfaces

```typescript
interface UserPreferences {
  style: 'academic' | 'casual' | 'business';
  detailLevel: 1 | 2 | 3 | 4 | 5;
  focusAreas: ('main_points' | 'examples' | 'implications' | 'citations')[];
}

interface Insight {
  insight: string;
  confidence: number;
  supporting_evidence: string;
}

interface Summary {
  key_points: string[];
  themes: string[];
  insights: Insight[];
  metadata: {
    word_count: number;
    processing_time: number;
    content_type: 'text' | 'video' | 'audio';
  };
}
```

### 2.3 Example Implementation
Here's a key example of how to structure the content processor:

```typescript
import { OpenAI } from 'openai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';
import { YoutubeTranscript } from 'youtube-transcript-api';
import { createWhisperInstance } from 'whisper-node';

export class ContentProcessor {
  private openai: OpenAI;
  private langChain: ChatOpenAI;
  private userPrefs: UserPreferences;

  constructor(apiKey: string, userPrefs: UserPreferences) {
    this.openai = new OpenAI({ apiKey });
    this.langChain = new ChatOpenAI({ openAIApiKey: apiKey });
    this.userPrefs = userPrefs;
  }

  private async structuredSummarization(content: string): Promise<Summary> {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: this.generateSystemPrompt()
        },
        {
          role: "user",
          content
        }
      ],
      functions: [
        {
          name: "generate_summary",
          description: "Generate a structured summary of the content",
          parameters: {
            type: "object",
            properties: {
              key_points: {
                type: "array",
                items: { type: "string" },
                description: "Main points from the content"
              },
              themes: {
                type: "array",
                items: { type: "string" },
                description: "Key themes identified"
              },
              insights: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    insight: { type: "string" },
                    confidence: { 
                      type: "number",
                      minimum: 0,
                      maximum: 1
                    },
                    supporting_evidence: { type: "string" }
                  },
                  required: ["insight", "confidence", "supporting_evidence"]
                }
              },
              metadata: {
                type: "object",
                properties: {
                  word_count: { type: "number" },
                  processing_time: { type: "number" },
                  content_type: { 
                    type: "string",
                    enum: ["text", "video", "audio"]
                  }
                },
                required: ["word_count", "processing_time", "content_type"]
              }
            },
            required: ["key_points", "themes", "insights", "metadata"]
          }
        }
      ],
      function_call: { name: "generate_summary" }
    });

    const functionCall = response.choices[0].message.function_call;
    return JSON.parse(functionCall.arguments) as Summary;
  }
}
```

## 3. Detailed Feature Requirements

### 3.1 Content Summarization

#### Requirements
- Support for multiple content types: articles, YouTube videos, blog posts, documents
- Three levels of summary conciseness (configurable by user)
- Multiple summary styles: academic, personal, business
- Automatic theme detection and categorization
- Original source link preservation
- Share functionality with unique URLs

#### Implementation Notes
- Use OpenAI's GPT-4 for text summarization
- Implement YouTube Transcript API for video content
- Use Whisper for audio processing
- Store summaries with metadata including source, date, and processing details

### 3.2 Content Organization

#### Requirements
- Landing page showing recent summaries
- Theme-based organization with color coding
- Medium-based categorization (article, video, audio, etc.)
- Chronological ordering within categories
- Individual summary pages with full details
- Theme and medium specific pages

#### Implementation Notes
- Use Shadcn components for consistent UI
- Implement color coding system for themes
- Create dynamic routes for themes and mediums
- Build responsive layouts for all screen sizes

### 3.3 User Preferences

#### Requirements
- Initial onboarding questionnaire
- Configurable topics of interest
- Summary style preferences
- Detail level preferences
- Editable preferences over time

#### Implementation Notes
- Store preferences in user profile
- Create guided onboarding flow
- Implement preference-based content filtering
- Allow real-time preference updates

### 3.4 Content Capture

#### Requirements
- Browser extension for automatic content detection
- Manual link submission
- Reading list functionality
- Automatic categorization of submitted content
- Cookie-based tracking for read status (where possible)

#### Implementation Notes
- Develop Chrome extension
- Implement URL metadata extraction
- Create reading list management system
- Build content tracking system

### 3.5 Search Functionality

#### Requirements
- Global search across all summaries
- Search by words, phrases, themes
- Filter by medium and date
- Persistent search bar in header

#### Implementation Notes
- Implement full-text search
- Create filtered search functionality
- Build search results page with filtering options

### 3.6 Content Relationships

#### Requirements
- Automatic link detection between related summaries
- Content recommendations based on themes
- Similar content suggestions
- Cross-referencing between summaries

#### Implementation Notes
- Implement similarity detection algorithm
- Create recommendation system
- Build relationship visualization

### 3.7 User Annotations

#### Requirements
- User ability to add notes to AI-generated summaries
- Collaborative summary enhancement
- Manual bullet point addition
- AI enhancement of user-added content

#### Implementation Notes
- Create annotation system
- Implement collaborative editing
- Build AI enhancement functionality

### 3.8 Export and Sharing

#### Requirements
- Summary export functionality
- Theme-based export
- Medium-based export
- Full repository export
- Social sharing features

#### Implementation Notes
- Implement export system for different formats
- Create sharing system with unique URLs
- Build batch export functionality

## 4. Technical Integration

### 4.1 AI Integration
- Use OpenAI API for content processing
- Implement LangChain for enhanced AI capabilities
- Use structured summarization with function calling
- Implement error handling and retry logic

### 4.2 Content Processing
- YouTube Transcript API for video content
- Whisper for audio processing
- URL metadata extraction
- Content type detection

### 4.3 Browser Extension
- Chrome extension development
- Content detection system
- Summary trigger mechanism
- Reading list integration

## 5. Performance Requirements
- Summary generation: < 5 seconds
- Page load time: < 2 seconds
- Search results: < 1 second
- Export generation: < 10 seconds
- Browser extension response: < 1 second

## 6. Security Requirements
- Secure API key management
- User data encryption
- Secure sharing links
- Rate limiting
- Input sanitization

## 7. Testing Requirements
- Unit tests for core functionality
- Integration tests for AI features
- End-to-end tests for user flows
- Browser extension testing
- Performance testing

## 8. Deployment Strategy
- Staged rollout
- Feature flags for gradual release
- Monitoring and logging
- Error tracking
- Usage analytics

## 9. Future Considerations
- Mobile app development
- Additional content type support
- Enhanced collaboration features
- Advanced analytics
- API access for third-party integration