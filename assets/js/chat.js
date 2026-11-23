/* Chat assistant.

   A small automated assistant in the corner of the page. It answers common
   questions from the content of this site (no AI service, no cost, nothing
   stored), and it can pass a visitor's message to Johora by email.

   Delivering messages:
   - With a Web3Forms access key below, messages are emailed straight to the
     address registered with that key. Get a free key at https://web3forms.com
     (enter japolin@wm.edu); the key is safe to keep in this public file.
   - Without a key, "Send" opens the visitor's own email app with the message
     filled in, addressed to japolin@wm.edu. */
(() => {
  const WEB3FORMS_KEY = ''; // paste the Web3Forms access key here
  const EMAIL = 'japolin@wm.edu';
  const SCHOLAR = 'https://scholar.google.com/citations?user=50AFRskAAAAJ';
  const LINKEDIN = 'https://www.linkedin.com/in/johora-akter-polin-577759232/';
  const CV = 'assets/Johora_Akter_Polin_CV.pdf';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------ answers
     Each topic has keywords and an answer. Answers are written here, so they
     can contain links; visitor text is always inserted as plain text. */
  const link = (href, text, ext) =>
    `<a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`;

  const TOPICS = [
    {
      id: 'research',
      words: ['research', 'work on', 'working on', 'interest', 'area', 'focus', 'topic', 'study', 'about you', 'what do you do'],
      chips: ['Projects', 'Publications', 'Send a message'],
      answer: () => `Johora builds reliable, efficient, and safety-aware intelligence for autonomous vehicles and agentic robots. Her work covers four areas:
        <ul>
          <li><strong>Robust multi-sensor perception</strong>: camera-LiDAR fusion, blind-zone-aware and all-weather detection</li>
          <li><strong>Agentic AI and foundation models</strong>: VLM reasoning agents with reinforcement learning</li>
          <li><strong>Edge AI</strong>: latency- and resource-aware perception on embedded platforms</li>
          <li><strong>Cooperative, safety-critical autonomy</strong>: V2I collision mitigation, HD maps, and event-aware black boxes</li>
        </ul>
        She tests her systems in CARLA with ROS 2 and on physical robotic vehicles. ${link('#research', 'See the research section')}.`,
    },
    {
      id: 'blindzone',
      words: ['blindzone', 'blind zone', 'blind-zone', 'occlusion', 'occluded', 'intersection', 'v2i', 'roadside'],
      chips: ['Projects', 'Send a message'],
      answer: () => `<strong>BlindZoneEye</strong> (under review at an IEEE journal) helps a vehicle act safely at occluded intersections. It fuses LiDAR occupancy, raycasting, and YOLOv11 into a blind-zone risk score, warns through a roadside unit over V2I, and records events in a black box. It reaches 92.3% blind-zone detection accuracy and 76.2% collision reduction, with 41 ms latency. ${link('#research', 'Read more')}.`,
    },
    {
      id: 'senseguard',
      words: ['senseguard', 'stale', 'staleness', 'latency', 'sensor-to-decision', 'agentic robot'],
      chips: ['Projects', 'Send a message'],
      answer: () => `<strong>SenseGuard</strong> (under review) keeps robots acting on fresh sensor data. SigLIP, Qwen2.5-VL, and a PPO policy decide how much of each camera frame and LiDAR scan to process. It lifts average camera mAP to 84.4%, cuts inference latency by 31%, and lowers LiDAR trajectory error by 75%. ${link('#research', 'Read more')}.`,
    },
    {
      id: 'vibrabox',
      words: ['vibrabox', 'vibration', 'black box', 'blackbox', 'replay', 'recording', 'failure'],
      chips: ['Projects', 'Send a message'],
      answer: () => `<strong>VibraBox</strong> (under review) is a vibration-adaptive black box for mobile robots. It keeps evidence before, during, and after failures, and a DQN controller tunes compression to the terrain. It saves up to 46% storage and cuts replay error to 4.2 &times; 10<sup>&minus;3</sup> degrees per frame. ${link('#research', 'Read more')}.`,
    },
    {
      id: 'logging',
      words: ['log what matters', 'logging', 'caal', 'most 2026', 'most\'26', 'adaptive logging'],
      chips: ['Publications', 'Send a message'],
      answer: () => `<strong>Log What Matters</strong> (IEEE MOST 2026, Detroit) decides which camera frames and LiDAR scans a connected vehicle should keep, using SigLIP, Qwen-VL, and reinforcement learning. It keeps 96.4% of objects while using 23% less camera storage and 27% less LiDAR storage. ${link('#research', 'Read more')}.`,
    },
    {
      id: 'weather',
      words: ['weather', 'rain', 'fog', 'snow', 'context-aware', 'context aware', 'sec 2025', 'sec\'25', 'all-weather'],
      chips: ['Publications', 'Send a message'],
      answer: () => `<strong>Context-Aware Perception</strong> (ACM/IEEE SEC 2025 workshop) uses vision-language models to read weather and visibility in the driving scene and adapt object detection, so perception holds up in rain, fog, and snow. ${link('#research', 'Read more')}.`,
    },
    {
      id: 'projects',
      words: ['project', 'projects', 'systems', 'built', 'build'],
      chips: ['BlindZoneEye', 'SenseGuard', 'VibraBox', 'Log What Matters'],
      answer: () => `Her current projects:
        <ul>
          <li><strong>BlindZoneEye</strong>: blind-zone detection and V2I warnings at occluded intersections</li>
          <li><strong>SenseGuard</strong>: keeping robot decisions on fresh sensor data</li>
          <li><strong>VibraBox</strong>: a vibration-adaptive black box for robot failures</li>
          <li><strong>Log What Matters</strong>: safety-aware adaptive logging (IEEE MOST 2026)</li>
          <li><strong>Context-Aware Perception</strong>: VLM-guided all-weather detection (SEC 2025)</li>
        </ul>
        Ask about any of them by name.`,
    },
    {
      id: 'publications',
      words: ['publication', 'publications', 'paper', 'papers', 'published', 'journal', 'conference', 'scholar', 'citation'],
      chips: ['Projects', 'CV', 'Send a message'],
      answer: () => `Johora has <strong>11 published papers</strong> and <strong>3 under review</strong>, including work at IEEE MOST 2026 and ACM/IEEE SEC 2025. ${link('#publications', 'Browse the publications')} or see ${link(SCHOLAR, 'Google Scholar', true)}.`,
    },
    {
      id: 'teaching',
      words: ['teach', 'teaching', 'course', 'class', 'instructor', 'lecturer', 'ta ', 'assistant', 'students', 'csci 100', 'coll'],
      chips: ['Education', 'Send a message'],
      answer: () => `In Fall 2026 she is <strong>Assistant Instructor</strong> for COLL/CSCI 100: Physical Intelligence: Robots at William &amp; Mary, where students program 5G-connected robotic vehicles on a smart-city roadway. She was a Graduate Teaching Assistant at W&amp;M (2024&ndash;25), and before that a Senior Lecturer and Lecturer at Daffodil International University (2021&ndash;24). ${link('#teaching', 'See teaching')}.`,
    },
    {
      id: 'education',
      words: ['education', 'degree', 'phd', 'ph.d', 'master', 'msc', 'bachelor', 'bsc', 'university', 'gpa', 'advisor', 'graduate', 'graduation'],
      chips: ['Research', 'Teaching'],
      answer: () => `<ul>
          <li><strong>Ph.D. in Computer Science</strong>, William &amp; Mary (2024&ndash;2029 expected), advised by Dr. Sidi Lu. GPA 3.95/4.00.</li>
          <li><strong>M.Sc. in CSE</strong>, Daffodil International University (2021&ndash;23). GPA 4.00/4.00.</li>
          <li><strong>B.Sc. in CSE</strong>, Daffodil International University (2015&ndash;20). GPA 3.90/4.00.</li>
        </ul>`,
    },
    {
      id: 'skills',
      words: ['skill', 'skills', 'tool', 'tools', 'stack', 'ros', 'carla', 'python', 'pytorch', 'jetson', 'yolo', 'lidar', 'language', 'programming'],
      chips: ['Projects', 'CV'],
      answer: () => `She works with VLMs and LLMs (Qwen2.5-VL, Llama, GPT-4o, SigLIP) and RL agents (PPO, DQN); 25+ camera detectors (YOLO v8&ndash;v11, RF-DETR, DINO); LiDAR tools (BEV, voxel grids, CenterPoint, KISS-ICP); ROS 2, CARLA, HD maps, and V2I; NVIDIA Jetson Orin; and Python, PyTorch, C, and C#. ${link('#skills', 'See all skills')}.`,
    },
    {
      id: 'awards',
      words: ['award', 'awards', 'grant', 'honor', 'service', 'reviewer', 'review', 'chair', 'volunteer'],
      chips: ['Publications', 'Send a message'],
      answer: () => `She received Student Travel Grants for IEEE MOST 2026 and ACM/IEEE SEC 2025. She serves as session chair for the EdgeCAV'26 workshop and as a reviewer for ACM/IEEE SEC'25 and SEC'26. ${link('#service', 'See service and awards')}.`,
    },
    {
      id: 'cv',
      words: ['cv', 'resume', 'résumé', 'vita'],
      chips: ['Publications', 'Send a message'],
      answer: () => `Here is her ${link(CV, 'CV (PDF)', true)}.`,
    },
    {
      id: 'contact',
      words: ['contact', 'email', 'reach', 'linkedin', 'connect', 'touch'],
      chips: ['Send a message'],
      answer: () => `You can email her at ${link('mailto:' + EMAIL, EMAIL)}, connect on ${link(LINKEDIN, 'LinkedIn', true)}, or leave a message right here and I'll pass it on.`,
    },
    {
      id: 'collab',
      words: ['collaborat', 'work with', 'work together', 'intern', 'internship', 'hire', 'hiring', 'job', 'position', 'opportunit', 'meet', 'talk', 'invite', 'speaker', 'seminar'],
      chips: ['Send a message', 'CV'],
      answer: () => `Johora welcomes collaborations, internships, and speaking invitations in autonomous driving, edge AI, and agentic robotics. Leave a short message and she'll get it by email.`,
    },
  ];

  const GREETING = `Hi! I'm Johora's assistant. I can tell you about her research, projects, publications, and teaching, or pass a message to her by email.`;
  const START_CHIPS = ['Research', 'Projects', 'Publications', 'Teaching', 'Send a message'];
  const FALLBACK = `I'm not sure about that one. I can answer questions about her research, projects, publications, teaching, education, and skills. Or leave a message and Johora will reply by email.`;

  const CHIP_TOPIC = {
    Research: 'research', Projects: 'projects', Publications: 'publications', Teaching: 'teaching',
    Education: 'education', CV: 'cv', BlindZoneEye: 'blindzone', SenseGuard: 'senseguard',
    VibraBox: 'vibrabox', 'Log What Matters': 'logging',
  };

  function findTopic(text) {
    const t = ` ${text.toLowerCase()} `;
    let best = null;
    let bestScore = 0;
    for (const topic of TOPICS) {
      let score = 0;
      for (const w of topic.words) if (t.includes(w)) score += w.length;
      if (score > bestScore) { bestScore = score; best = topic; }
    }
    return best;
  }

  /* ------------------------------------------------------ widget */
  const root = document.createElement('div');
  root.className = 'chat';
  root.innerHTML = `
    <button class="chat-launch" type="button" aria-expanded="false" aria-controls="chat-panel">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><circle cx="8" cy="11" r="1.2"/><circle cx="12" cy="11" r="1.2"/><circle cx="16" cy="11" r="1.2"/></svg>
      <span>Chat with me</span>
    </button>
    <section class="chat-panel" id="chat-panel" role="dialog" aria-label="Chat with Johora's assistant" hidden>
      <header class="chat-head">
        <img class="chat-avatar" src="assets/img/profile.jpg" alt="" onerror="this.hidden=true">
        <div>
          <p class="chat-title">Johora's assistant</p>
          <p class="chat-sub">Automated replies from this site. Messages go to her email.</p>
        </div>
        <button class="chat-close" type="button" aria-label="Close chat">&times;</button>
      </header>
      <div class="chat-log" aria-live="polite"></div>
      <div class="chat-chips"></div>
      <form class="chat-form" autocomplete="on">
        <label class="visually-hidden" for="chat-input">Your message</label>
        <input id="chat-input" class="chat-input" type="text" placeholder="Ask about my research…" maxlength="1000">
        <button class="chat-send" type="submit" aria-label="Send">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.4 20.4l17.5-7.5a1 1 0 0 0 0-1.8L3.4 3.6a.8.8 0 0 0-1.1.9L4 11l9 1-9 1-1.7 6.5a.8.8 0 0 0 1.1.9z"/></svg>
        </button>
      </form>
    </section>`;
  document.body.appendChild(root);

  const launch = root.querySelector('.chat-launch');
  const panel = root.querySelector('.chat-panel');
  const log = root.querySelector('.chat-log');
  const chipsBox = root.querySelector('.chat-chips');
  const form = root.querySelector('.chat-form');
  const input = root.querySelector('.chat-input');
  const closeBtn = root.querySelector('.chat-close');

  let started = false;
  let flow = null; // message-taking state: { step, name, email, message }

  function scrollDown() {
    log.scrollTo({ top: log.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function addUser(text) {
    const b = document.createElement('div');
    b.className = 'msg msg-user';
    b.textContent = text;
    log.appendChild(b);
    scrollDown();
  }

  function addBot(html, chips) {
    setChips([]);
    const typing = document.createElement('div');
    typing.className = 'msg msg-bot msg-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    typing.setAttribute('aria-hidden', 'true');
    log.appendChild(typing);
    scrollDown();
    window.setTimeout(() => {
      typing.remove();
      const b = document.createElement('div');
      b.className = 'msg msg-bot';
      b.innerHTML = html;
      log.appendChild(b);
      setChips(chips || []);
      scrollDown();
    }, reduceMotion ? 0 : 450);
  }

  function setChips(list) {
    chipsBox.innerHTML = '';
    list.forEach((label) => {
      const c = document.createElement('button');
      c.type = 'button';
      c.className = 'chip';
      c.textContent = label;
      c.addEventListener('click', () => handle(label, true));
      chipsBox.appendChild(c);
    });
  }

  function setPlaceholder() {
    const ph = {
      name: 'Your name',
      email: 'Your email address',
      message: 'Your message',
    };
    input.placeholder = flow ? ph[flow.step] || 'Type here…' : 'Ask about my research…';
    input.type = flow && flow.step === 'email' ? 'email' : 'text';
  }

  /* ------------------------------------------------------ message flow */
  function startMessage() {
    flow = { step: 'name' };
    setPlaceholder();
    addBot(`Happy to pass a message to Johora. What's your name?`, ['Cancel']);
  }

  function cancelMessage() {
    flow = null;
    setPlaceholder();
    addBot('No problem. Anything else you would like to know?', START_CHIPS);
  }

  async function deliver() {
    const subject = `Website message from ${flow.name}`;
    const body = `${flow.message}\n\nFrom: ${flow.name}\nEmail: ${flow.email}\nSent from the chat on her website.`;
    if (!WEB3FORMS_KEY) {
      const href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = href;
      return 'mailto';
    }
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject,
        from_name: 'Website chat',
        name: flow.name,
        email: flow.email,
        replyto: flow.email,
        message: flow.message,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || 'send failed');
    return 'sent';
  }

  async function messageStep(text) {
    if (/^cancel$/i.test(text.trim())) { cancelMessage(); return; }
    if (flow.step === 'name') {
      flow.name = text.trim().slice(0, 80);
      flow.step = 'email';
      setPlaceholder();
      addBot(`Thanks, ${escapeHtml(flow.name)}. What email address should she reply to?`, ['Cancel']);
    } else if (flow.step === 'email') {
      const email = text.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        addBot('That email address doesn\'t look complete. Please check it and try again.', ['Cancel']);
        return;
      }
      flow.email = email;
      flow.step = 'message';
      setPlaceholder();
      addBot('What would you like to tell her?', ['Cancel']);
    } else if (flow.step === 'message') {
      flow.message = text.trim();
      flow.step = 'confirm';
      setPlaceholder();
      addBot(`Ready to send this to Johora?<blockquote>${escapeHtml(flow.message)}</blockquote>From ${escapeHtml(flow.name)} (${escapeHtml(flow.email)})`, ['Send message', 'Edit message', 'Cancel']);
    } else if (flow.step === 'confirm') {
      if (/^edit/i.test(text)) {
        flow.step = 'message';
        setPlaceholder();
        addBot('Sure. Type the new message.', ['Cancel']);
        return;
      }
      if (!/^send/i.test(text)) {
        addBot('Choose "Send message" to send it, or "Edit message" to change it.', ['Send message', 'Edit message', 'Cancel']);
        return;
      }
      setChips([]);
      try {
        const how = await deliver();
        flow = null;
        setPlaceholder();
        addBot(how === 'mailto'
          ? `Your email app should open with the message ready to send to ${link('mailto:' + EMAIL, EMAIL)}. Press send there and Johora will get it.`
          : `Sent! Johora will reply to you by email. Anything else?`, START_CHIPS);
      } catch (e) {
        addBot(`The message couldn't be sent just now. Please email her directly at ${link('mailto:' + EMAIL, EMAIL)}.`, START_CHIPS);
        flow = null;
        setPlaceholder();
      }
    }
  }

  function escapeHtml(t) {
    const d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
  }

  /* ------------------------------------------------------ routing */
  function handle(text, fromChip) {
    const clean = text.trim();
    if (!clean) return;
    addUser(clean);
    if (flow) { messageStep(clean); return; }
    if (/^send a message$/i.test(clean) || /\b(message|leave a note|send)\b/i.test(clean) && !fromChip) {
      startMessage();
      return;
    }
    if (/^(hi|hello|hey|salam|assalamu|good (morning|afternoon|evening))\b/i.test(clean)) {
      addBot(`Hello! ${GREETING.replace(/^Hi! /, '')}`, START_CHIPS);
      return;
    }
    if (/\b(thanks|thank you|thx)\b/i.test(clean)) {
      addBot('You\'re welcome! Anything else?', START_CHIPS);
      return;
    }
    const topic = fromChip && CHIP_TOPIC[clean] ? TOPICS.find((t) => t.id === CHIP_TOPIC[clean]) : findTopic(clean);
    if (topic) addBot(topic.answer(), topic.chips);
    else addBot(FALLBACK, START_CHIPS);
  }

  function open() {
    panel.hidden = false;
    launch.setAttribute('aria-expanded', 'true');
    root.classList.add('is-open');
    if (!started) {
      started = true;
      addBot(GREETING, START_CHIPS);
    }
    window.setTimeout(() => input.focus(), 50);
  }
  function close() {
    panel.hidden = true;
    launch.setAttribute('aria-expanded', 'false');
    root.classList.remove('is-open');
    launch.focus();
  }

  // Float above the drive strip's caption bar while it is on screen, so the
  // button never covers the Perceive / Reason / Act text or the pause button.
  const hud = document.querySelector('.drive-hud');
  let placing = false;
  function place() {
    placing = false;
    let lift = 20;
    if (hud) {
      const r = hud.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.top < vh && r.bottom > vh - 90) lift = Math.max(20, vh - r.top + 14);
    }
    root.style.setProperty('--chat-bottom', `${Math.round(lift)}px`);
  }
  const queuePlace = () => { if (!placing) { placing = true; window.requestAnimationFrame(place); } };
  window.addEventListener('scroll', queuePlace, { passive: true });
  window.addEventListener('resize', queuePlace);
  place();

  launch.addEventListener('click', () => (panel.hidden ? open() : close()));
  closeBtn.addEventListener('click', close);
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value;
    input.value = '';
    handle(text, false);
  });
})();
