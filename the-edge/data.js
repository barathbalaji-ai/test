/* ============================================================
   THE EDGE — content model
   Faithfully transcribed from the "Q1 Programs Playbook /
   The Edge — A Playbook for Support & Excellence".
   All copy preserved; structured for interactive rendering.
   ============================================================ */
window.EDGE = (function () {
  const A = './assets/';

  /* ---- The three chapters + closing ---- */
  const chapters = [
    {
      id: 'prioritisation',
      index: 1,
      title: 'Effective\nPrioritisation',
      kicker: 'Chapter One',
      tile: A + 'pie-painter.png',
      hero: A + 'desk-thoughts.png',
      tagline: 'Pause. Choose. Sequence.',
      summary:
        'The discipline of choosing what matters most before acting — not what’s loudest, easiest, or most urgent.',
      accent: '#3E6FBE',
      blocks: [
        {
          type: 'intro',
          art: A + 'pause-choose-seq.png',
          lede:
            'Effective Prioritisation is the discipline of choosing what matters most before acting — not what’s loudest, easiest, or most urgent.',
          punch: 'Speed gets tasks done. Prioritisation gets results.',
          accent: 'Pause. Choose. Sequence.',
          body:
            'This framework helps support agents make better decisions by answering three simple questions:',
          bullets: [
            'What to work on today?',
            'What to work on right now?',
            'How to stay focused while doing it?',
          ],
        },
        {
          type: 'compare',
          heading: 'What Prioritisation is and isn’t',
          isTitle: 'It is',
          is: [
            'Intentional sequencing of work',
            'Deciding what matters most right now',
            'Making trade-offs under pressure',
            'Pausing before choosing',
            'Impact-driven decision making',
          ],
          isntTitle: 'It isn’t',
          isnt: [
            'Handling the loudest customer first',
            'Picking the easiest ticket first',
            'Clearing your queue as fast as possible',
            'Reacting to every Slack ping',
            'Assuming chat silence means resolved',
          ],
        },
        {
          type: 'technique',
          n: 1,
          name: 'The 3 Criteria',
          kind: 'accordion',
          intro: 'So what can you do? Start by scoring the work on three simple lenses.',
          items: [
            { k: 'Urgency', v: 'How time-sensitive is this? What breaks if it waits?' },
            { k: 'Importance', v: 'How significant is the impact on the customer or business?' },
            { k: 'Deadlines', v: 'Are there hard SLA or contractual constraints in play?' },
          ],
        },
        {
          type: 'technique',
          n: 2,
          name: 'Prioritisation Lens — PIEEE',
          kind: 'pieee',
          art: A + 'pie-painter.png',
          items: [
            { k: 'P', t: 'Problem Impact', v: 'Who is affected and how severe is the issue?' },
            { k: 'I', t: 'Immediacy', v: 'What breaks if this waits?' },
            { k: 'E', t: 'Effort vs Value', v: 'Is this a high-impact quick win or a low-value deep dive?' },
            { k: 'E', t: 'Escalation Risk', v: 'Will delay increase churn, complaints, or leadership attention?' },
          ],
          formula: 'Priority = Impact + Immediacy + Value + Escalation Risk',
          note: 'PIEEE helps in prioritizing based on business and customer impact, not noise.',
        },
        {
          type: 'technique',
          n: 3,
          name: 'Pickle Jar Theory',
          kind: 'picklejar',
          art: A + 'pickle-desk.png',
          intro:
            'Think of your workday as a jar. The order you fill it matters. Big rocks must go in first, followed by pebbles, sand & water!',
          layers: [
            { k: 'Rocks', tag: 'Critical tasks', v: 'SLA-bound tickets, escalations, high-impact issues.', rule: 'Go in first, always.' },
            { k: 'Pebbles', tag: 'Important tasks', v: 'Follow-ups, pending validations, moderate-impact tickets.', rule: 'Fit around rocks.' },
            { k: 'Sand', tag: 'Nice-to-do tasks', v: 'Admin, low-urgency tickets, non-blocking queries.', rule: 'Fill remaining space.' },
            { k: 'Water', tag: 'Lowest priority', v: 'Optional reading, internal updates.', rule: 'Handle only when everything else fits.' },
          ],
        },
        {
          type: 'technique',
          n: 4,
          name: 'Pomodoro Technique',
          kind: 'pomodoro',
          art: A + 'tomato.png',
          intro:
            'Once you know what to work on (PIEEE) and have sized your day (Pickle Jar), the Pomodoro keeps you focused while doing it. 25 minutes of full attention, then a deliberate break. Repeat four times, then a longer reset.',
          steps: [
            'Decide on task',
            'Set timer to 25 min',
            'Work until it rings',
            '5-min break',
            'After 4 rounds → 15–30 min break',
          ],
          outcome:
            'Pomodoro helps maintain decision quality, reduce fatigue, and improve consistency.',
          note: 'Note for Support Agents: Adapt to the nature of your work.',
        },
        {
          type: 'together',
          heading: 'How the Techniques Work Together',
          art: A + 'three-shapes.png',
          items: [
            { k: 'PIEEE', v: 'Decision' },
            { k: 'Pickle Jar', v: 'Organise' },
            { k: 'Pomodoro', v: 'Maintain Focus' },
          ],
        },
        {
          type: 'checklist',
          heading: 'Common Prioritisation Traps',
          art: A + 'ostrich-rider.png',
          items: [
            'Reacting to the loudest request instead of the highest-impact issue',
            'Prioritising easy tickets over important ones',
            'Confusing urgency with importance',
            'Spending too long on low-value investigations',
            'Ignoring callbacks or customer commitments',
            'Constantly switching context without finishing critical work',
            'Letting Slack, chats, or notifications control the day',
          ],
          closing:
            'Effective prioritisation is not about doing everything quickly. It is about consistently focusing on the work that creates the greatest customer impact.',
        },
        {
          type: 'reflect',
          heading: 'Let’s Reflect',
          key: 'reflect_prioritisation',
          prompts: [
            'Think of a day where you were busy all day but felt like nothing really got resolved. What was actually happening in that time?',
            'If a colleague could shadow you for one day and give you one honest piece of feedback on how you prioritise — what do you think they would say?',
            'What belief about being a good support agent might actually be slowing you down? For example — “I need to respond to everything quickly” or “clearing my queue means I did a good job.”',
            'The specific change I am making starting this week is',
          ],
        },
      ],
    },

    {
      id: 'emotional-intelligence',
      index: 2,
      title: 'Emotional\nIntelligence',
      kicker: 'Chapter Two',
      tile: A + 'ei-pot-seas.png',
      hero: A + 'ei-pot-seas.png',
      tagline: 'Respond with intention, not emotion.',
      summary:
        'Stay effective under pressure by managing emotions, reading customer cues, and choosing the right response.',
      accent: '#4472B8',
      blocks: [
        {
          type: 'intro',
          art: A + 'ei-pot-seas.png',
          lede:
            'Emotional intelligence helps you stay effective under pressure by managing emotions, reading customer cues, and choosing the right response.',
        },
        {
          type: 'pillars',
          heading: 'The 4 pillars of Emotional Intelligence',
          items: [
            {
              k: 'Self-Awareness',
              v: [
                'Know what you feel — you cannot manage what you cannot see.',
                'Name your emotions, identify triggers, notice physical cues & check your mood before every interaction.',
              ],
            },
            {
              k: 'Self-Management',
              v: [
                'Choose what you do.',
                'Pause before reacting, adjust tonality, use emotion-neutral language, reframe thoughts, set emotional boundaries, reset between interactions.',
              ],
            },
            {
              k: 'Social Awareness',
              v: [
                'Read the room / audience — avoid presumption and unconscious bias.',
                'Listen actively, identify what the customer is really feeling, read urgency and emotional pulse.',
              ],
            },
            {
              k: 'Social Skills',
              v: [
                'Respond well.',
                'Communicate clearly with empathy, address conflict/s early & set the right expectations.',
              ],
            },
          ],
        },
        {
          type: 'technique',
          n: 1,
          name: 'STOP & Pause — Take a Breath',
          kind: 'stop',
          art: A + 'breathing-478.png',
          intro:
            'You do not get stressed by situations. You get stressed by the story you tell yourself about the situation.',
          steps: [
            { k: 'Stop', hl: 'Not responding immediately is not slow — it’s smart.', v: 'Don’t type immediately. Don’t reply on autopilot. Even a 2-second pause counts. Resist the pull to respond before you have thought.' },
            { k: 'Take a Breath', hl: 'Your breath is the fastest reset button you have.', v: 'One deep breath slows the stress response. Inhale through nose (4 sec). Exhale through mouth (6 sec). The longer exhale activates your calm-down system.' },
            { k: 'Observe', hl: 'Observe the feeling. Don’t become it.', v: 'Notice without judging. Ask: What am I feeling right now? What thought just appeared? What is the customer actually expressing — beneath the words?' },
            { k: 'Proceed', hl: 'Proceed with intention, not emotion.', v: 'Choose your tone, pace, and words deliberately. Adjust to what this customer actually needs. Move forward with intention, not residual emotion.' },
          ],
          breathing: { in: 4, hold: 7, out: 8, note: '4 · 7 · 8 — the breath that resets you' },
        },
        {
          type: 'technique',
          n: 2,
          name: 'Reframing',
          kind: 'reframe',
          art: A + 'reframe-bubbles.png',
          intro:
            'Same Situation, New Story — the Reframe Drill. Reframing does not deny reality. It changes how you interpret it. The situation stays the same. Your emotional reaction changes.',
          scenarios: [
            {
              n: 1,
              happened: 'Customer says: “Is anyone even looking at this?”',
              auto: 'They’re accusing me of ignoring them',
              reframe: 'They’re anxious about progress and need a visible sign someone is on it',
            },
            {
              n: 2,
              happened: 'Your lead says: “This needs improvement.”',
              auto: 'I messed up — they think I’m not good enough',
              reframe: 'This is feedback on one specific piece of work, not a verdict on me as a person',
            },
            {
              n: 3,
              happened: 'Customer follows up again after 10 minutes',
              auto: 'They’re impatient and unreasonable',
              reframe: 'They’re worried about delays — something about this matters to them urgently',
            },
          ],
        },
        {
          type: 'technique',
          n: 3,
          name: 'EEC Model',
          kind: 'eec',
          art: A + 'eec-laptop.png',
          intro:
            'When receiving feedback, the EEC model gives you a structure to process it without defensiveness. When giving feedback, it gives you a structure that is honest without being brutal.',
          items: [
            { k: 'E', t: 'Example', v: 'what specifically happened?' },
            { k: 'E', t: 'Effect', v: 'what impact did it have?' },
            { k: 'C', t: 'Change or continue', v: 'what should shift?' },
          ],
        },
        {
          type: 'checklist',
          heading: 'Best Practices',
          sub: 'Before and during interactions',
          art: A + 'coffee-steam.png',
          rich: [
            { b: 'Always do a mood check before your first interaction', t: '— Your emotional state decides the lens through which you read every customer until you reset it.' },
            { b: 'Read what the customer is feeling', t: '— not just what they are saying. A customer typing in ALL CAPS is not aggressive — they are probably scared. Respond to the feeling underneath the words.' },
            { b: 'Adapt your tone, pace, and depth to each customer', t: '— A calm analytical customer needs precision. An anxious customer needs reassurance first. The same response does not work for both.' },
            { b: 'Use neutral language', t: '— Be specific, not scripted. Overused phrases like “I understand your frustration” land as dismissive when they are not backed by action.' },
            { b: 'Stay curious', t: '— don’t judge the situation before you have fully heard it. The moment you decide you already know what is happening, you stop listening.' },
          ],
        },
        {
          type: 'compare',
          heading: 'What low EI looks like? Avoid These!',
          isTitle: 'In Yourself',
          is: [
            'Blaming the customer for the difficulty',
            'Taking feedback as a personal attack',
            'Staying polite but emotionally disconnected',
            'Carrying one bad interaction into the next',
            'Passive-aggressive communication',
          ],
          isntTitle: 'In your team',
          isnt: [
            'Office gossip about customers',
            'Defending instead of understanding',
            'Treating all urgency as equal',
            'Diverse opinions not welcome',
            'Victim statements — “if only they would…”',
          ],
          tone: 'warn',
          closing:
            'The goal is not to eliminate your emotions. The goal is to make sure your emotions are informing your response — not driving it.',
          closingArt: A + 'coffee-steam.png',
        },
        {
          type: 'reflect',
          heading: 'Let’s Reflect',
          key: 'reflect_ei',
          prompts: [
            'Are there specific types of customers or stakeholders you find yourself less patient with? What do they have in common — and what does that tell you about your own triggers?',
            'What would you stop carrying if you truly accepted that a difficult customer’s frustration is almost never about you personally?',
            'Building emotional stamina means practising these tools on the hardest days, not just the easy ones. What is your plan for the next time you are at your worst and still have a full queue?',
          ],
        },
      ],
    },

    {
      id: 'ownership',
      index: 3,
      title: 'Ownership &\nAccountability',
      kicker: 'Chapter Three',
      tile: A + 'ownership-juggle.png',
      hero: A + 'ownership-juggle.png',
      tagline: 'Be the one who stayed.',
      summary:
        'Together they decide whether a customer remembers you as someone who was there, or someone who disappeared.',
      accent: '#3E6DBE',
      blocks: [
        {
          type: 'intro',
          art: A + 'ownership-juggle.png',
          rich2: [
            { b: 'Ownership', t: ' is proactive — you act before being asked.' },
            { b: 'Accountability', t: ' is reactive — you answer for what happened.' },
          ],
          lede:
            'Together they determine whether a customer remembers you as someone who was there, or someone who disappeared.',
        },
        {
          type: 'compare',
          heading: 'Ownership vs Accountability',
          isTitle: 'Ownership',
          isLede:
            '“This is my problem.” You act before being asked. You stay involved. You communicate. You care about the outcome — not just completing the task.',
          is: [
            'Take initiative without being told',
            'Treat the task like it’s yours',
            'Fix problems proactively',
            'Check if the whole is on track',
          ],
          isntTitle: 'Accountability',
          isntLede:
            '“I am answerable for the outcome.” You don’t shift blame. You explain what went wrong and what you will do differently next time.',
          isnt: [
            'Take responsibility for results',
            'Don’t disappear when things go wrong',
            'Explain clearly, without excuses',
            'Accept consequences and learn',
          ],
          tone: 'neutral',
        },
        {
          type: 'formula',
          heading: 'The Formula',
          formula: 'Acknowledge + Take ownership + Action + Timeline',
          example:
            '“I understand this is urgent. I’ll personally look into it and follow up with the team right away. I’ll update you by 3 PM — even if there is no progress to report.”',
        },
        {
          type: 'checklist',
          heading: 'Best Practices',
          sub: 'Before, during, and after every interaction',
          art: A + 'celebrate-laptop.png',
          items: [
            'Read the full ticket history before responding.',
            'Validate the issue, not just acknowledge it.',
            'Set realistic expectations and honour them.',
            'Follow up before the customer asks.',
            'Escalate early, not during a crisis.',
            'Never hand off without complete context.',
            'Confirm resolution before closing.',
            'Ask for help early when needed.',
          ],
          section2: {
            sub: 'End of Every Shift',
            items: [
              'Update every active ticket with a clear status.',
              'Ask yourself: Did I own the outcome or just respond?',
            ],
          },
          closing:
            'Ownership is not about doing everything yourself. It is about ensuring the customer gets the outcome they need.',
        },
        {
          type: 'reflect',
          heading: 'Let’s Reflect',
          key: 'reflect_ownership',
          prompts: [
            'Have you ever passed a ticket on and felt relief rather than concern for the customer? What was happening in that moment — and what does that tell you about where your ownership was?',
            'I will retire the phrase “someone will get back to you” from my vocabulary. What will I say instead — and how will I make sure I can actually keep that promise?',
            'I will send one proactive update to every open ticket before I go off shift — even when there is nothing new to report. What would you actually say in that update when you have no progress to share? And what do you think of your response if you are on the receiving end?',
          ],
        },
      ],
    },
  ];

  /* ---- Closing / Commitment chapter ---- */
  const closing = {
    id: 'commitment',
    title: 'Outcome &\nCommitment',
    kicker: 'The Journey',
    tile: A + 'congrats-confetti.png',
    congratsArt: A + 'congrats-confetti.png',
    finallyArt: A + 'and-finally.png',
    congrats: {
      hand: 'Congratulations',
      punch: 'You showed up. You invested in your growth. Most importantly, you started making a shift.',
      body:
        'These were never three separate programs. They were one journey — three chapters, each building on the last.',
    },
    commitments: [
      {
        id: 'c_prioritisation',
        title: 'Effective prioritisation',
        lede: 'You changed what you do.',
        body:
          'You stopped reacting to the loudest voice and started focusing on what matters most. You learned to prioritise with intention and create greater impact using tools like PIEEE Lens, Pickle Jar and Pomodoro.',
        promptLabel: 'My Commitment',
        prompt:
          'The one prioritisation trap I know I fall into most — and the specific thing I will do differently starting tomorrow:',
        key: 'commit_prioritisation',
      },
      {
        id: 'c_ei',
        title: 'Emotional intelligence',
        lede: 'You changed how you respond.',
        body:
          'You learned to recognise emotions, pause before reacting, and choose your response with intention. You created the space where better decisions, stronger relationships, and meaningful outcomes begin through tools like STOP, Reframing and EEC Model.',
        promptLabel: 'My Commitment',
        prompt:
          'The trigger I know activates me fastest — and the specific step from STOP or the reframe table I will use next time it arrives:',
        key: 'commit_ei',
      },
      {
        id: 'c_ownership',
        title: 'Ownership & accountability',
        lede: 'You changed who you are.',
        body:
          'You decided that your name means something on every interaction you touch. You moved from completing tasks to owning outcomes, and from responding to customers to staying with them until the problem is truly resolved with tools like Golden Formula and Language of Ownership.',
        promptLabel: 'My Commitment',
        prompt:
          'The one ownership habit I want to be known for — and what it would look like in a specific interaction this week:',
        key: 'commit_ownership',
      },
    ],
  };

  /* ---- Daily Edge nudges: one surfaces each day ---- */
  const dailyDeck = [
    { tag: 'Prioritisation', chapter: 'prioritisation', art: A + 'pause-choose-seq.png', title: 'Pause. Choose. Sequence.', body: 'Before you touch the queue, ask: what one thing, if resolved now, changes the most for a customer? Start there.' },
    { tag: 'PIEEE Lens', chapter: 'prioritisation', art: A + 'pie-painter.png', title: 'Score it, don’t feel it', body: 'Problem impact · Immediacy · Effort vs Value · Escalation risk. Rank today’s top three tickets on PIEEE before you reply to any.' },
    { tag: 'Pickle Jar', chapter: 'prioritisation', art: A + 'pickle-desk.png', title: 'Rocks go in first', body: 'SLA-bound and escalations are rocks — they go in before pebbles, sand or water. Place your rocks for today, right now.' },
    { tag: 'Pomodoro', chapter: 'prioritisation', art: A + 'tomato.png', title: '25 minutes, full attention', body: 'Pick one task. Set 25 minutes. No tabs, no pings. Then a real break. Tap below to run a focus round now.', action: 'pomodoro' },
    { tag: 'Emotional Intelligence', chapter: 'emotional-intelligence', art: A + 'breathing-478.png', title: 'Breathe before you type', body: 'Your breath is the fastest reset button you have. Run one 4·7·8 cycle before your first interaction today.', action: 'breathe' },
    { tag: 'Reframing', chapter: 'emotional-intelligence', art: A + 'reframe-bubbles.png', title: 'Same situation, new story', body: '“Is anyone even looking at this?” isn’t an attack — it’s anxiety needing a visible sign someone is on it. Flip one auto-story today.' },
    { tag: 'Self-Awareness', chapter: 'emotional-intelligence', art: A + 'ei-pot-seas.png', title: 'Do a mood check', body: 'Your emotional state is the lens you read every customer through until you reset it. Name what you feel before interaction one.' },
    { tag: 'EEC Model', chapter: 'emotional-intelligence', art: A + 'eec-laptop.png', title: 'Feedback without the flinch', body: 'Example → Effect → Change. Use it to give feedback that’s honest without being brutal, or to receive it without defence.' },
    { tag: 'Ownership', chapter: 'ownership', art: A + 'ownership-juggle.png', title: 'Own the outcome', body: 'Acknowledge + Take ownership + Action + Timeline. Send one proactive update before a customer has to ask today.' },
    { tag: 'Ownership', chapter: 'ownership', art: A + 'celebrate-laptop.png', title: 'Retire one phrase', body: '“Someone will get back to you.” Replace it with a name, an action, and a time. Say it once today and keep it.' },
    { tag: 'Accountability', chapter: 'ownership', art: A + 'and-finally.png', title: 'End-of-shift ritual', body: 'Before you log off: update every active ticket with a clear status, and ask — did I own the outcome, or just respond?' },
  ];

  const introCards = {
    cover: { hero: A + 'cover-hero.png', wordmark: A + 'wordmark.png', title: 'The Edge', sub: 'A Playbook for Support & Excellence' },
    creed: { art: A + 'learn-reflect-apply.png', words: ['Learn', 'Reflect', 'Apply'] },
  };

  return { chapters, closing, dailyDeck, introCards, ASSET: A };
})();
