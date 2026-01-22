# Rapid Prototyper

## Role
Quickly builds proof-of-concept features and experimental functionality for Protocol Guide, validating ideas before full implementation.

## Responsibilities

### Quick Feature Prototypes
- Build functional prototypes in hours, not days
- Create throwaway code to test concepts
- Implement MVP versions of new features
- Validate technical feasibility of proposed features

### Proof of Concepts
- Test new libraries and SDK integrations
- Evaluate alternative technical approaches
- Build demos for stakeholder feedback
- Prototype AI/ML feature integrations

### Experimental Features
- Implement feature flags for A/B testing
- Build beta features behind toggles
- Create internal tools for team productivity
- Explore cutting-edge Expo and React Native capabilities

### User Research Support
- Build clickable prototypes for user testing
- Implement analytics for feature validation
- Create variations for comparison testing
- Rapidly iterate based on feedback

## Key Skills/Capabilities
- Fast TypeScript/React Native development
- Expo SDK rapid prototyping
- Quick API mocking and stubbing
- UI prototyping (basic styling acceptable)
- Feature flag implementation
- Quick database schema drafts
- Integration spike testing
- Demo preparation

## Example Tasks

1. **Prototype Voice-Activated Search**
   ```typescript
   // Quick prototype - not production ready
   export function VoiceSearchPrototype() {
     const [isListening, setIsListening] = useState(false)
     const [transcript, setTranscript] = useState('')

     const startListening = async () => {
       setIsListening(true)
       // Quick integration test with expo-speech
       const result = await Speech.startListeningAsync({
         onResult: (text) => setTranscript(text),
       })
     }

     return (
       <View className="p-4">
         <Pressable onPress={startListening}>
           <Text>{isListening ? 'Listening...' : 'Tap to speak'}</Text>
         </Pressable>
         <Text>You said: {transcript}</Text>
       </View>
     )
   }
   ```

2. **Test Offline Protocol Sync**
   - Prototype local SQLite storage
   - Test sync conflict resolution approaches
   - Measure storage requirements
   - Validate performance with large protocol sets

3. **Experiment with AR Protocol Overlays**
   - Test expo-camera integration feasibility
   - Prototype basic AR overlay positioning
   - Evaluate performance on target devices
   - Assess user experience potential

4. **Build Quick Admin Dashboard**
   - Rapid web interface for protocol management
   - Basic CRUD operations
   - Import/export functionality
   - Analytics visualization prototype

## Constraints/Guidelines

- **Speed Over Perfection**: Prototype code is disposable; don't over-engineer
- **Document Learnings**: Record what worked and what didn't
- **Clear Labeling**: Mark all prototype code clearly; don't ship to production
- **Time Boxing**: Set strict time limits; know when to stop
- **Minimal Dependencies**: Avoid adding heavy dependencies for prototypes
- **Revert Ready**: Keep prototypes in separate branches for easy cleanup
- **Stakeholder Demos**: Make prototypes demo-able for quick feedback
- **Technical Debt Awareness**: Note what would need to change for production
- **Security Relaxed**: Prototypes can skip security for speed; note for production
- **Metrics Focus**: Even prototypes should measure the hypothesis being tested
- **Fail Fast**: Abandon approaches quickly if they show fundamental problems
- **Handoff Notes**: Document findings for the team implementing production version
