/* =============================================================
   RECENT NEWS
   Edit this list to update the News section. Newest item first.
   The first 3 items show as cards; the rest appear under "Show all news".

   Each item can have:
     date     text shown on the left, e.g. "Nov 2026"            (required)
     title    headline; type \n where you want a line break      (required)
     text     a sentence or two of detail                        (optional)
     image    photo path, e.g. "assets/news/2026-11-panel.jpg"   (optional)
     video    a video file such as "assets/news/demo.mp4",
              or a YouTube link                                  (optional)
     poster   still image shown before a video file plays        (optional)
     alt      short description of the photo or video            (optional)
     caption  text under the enlarged photo (defaults to title)   (optional)
     position "top" keeps the top of a tall image (a flyer or poster)
              in view on the card; the full image opens on click   (optional)
     fit      "contain" for diagrams, so nothing is cropped;
              photos fill the frame by default                   (optional)
     frame    "browser" shows a website screenshot inside a
              browser-window frame                               (optional)
     frameLabel  text in that frame's address bar                (optional)
     link     { href: "https://...", label: "Read more" }        (optional)
     tag      "Talk", "Teaching", "Service", "Paper", or "Award";
              shown as a small label on the card                 (optional)
     cover    for items without a photo: { title: "SEC'25",
              sub: "one short line" } draws a styled cover        (optional)

   Put photos and videos in the assets/news/ folder. Keep each video
   file under about 25 MB, or upload it to YouTube and paste the link.
   ============================================================= */

window.NEWS = [
  {
    date: "Nov 2026",
    tag: "Talk",
    title: "Student panelist at the W&M Computer Science Symposium for Graduate Studies",
    text: "Joined fellow Ph.D. students on the student and alumni panel at William & Mary to talk about my research in autonomous driving.",
    image: "assets/news/2026-11-cs-symposium-panel.jpg",
    alt: "Six Ph.D. students seated on stage below a slide titled Student / Alumni Panel, W&M Computer Science Graduate Studies",
    caption: "Student and alumni panel, W&M Computer Science Symposium for Graduate Studies, November 2026"
  },
  {
    date: "Fall 2026",
    tag: "Teaching",
    title: "Assistant instructor\nCOLL/CSCI 100: Physical Intelligence: Robots",
    text: "Helping students program 5G-connected robotic vehicles on a smart-city roadway. I built and maintain the course website.",
    image: "assets/news/2026-fall-course-website.jpg",
    frame: "browser",
    alt: "Home page of the COLL/CSCI 100 course website, with a photo of students in the Vehicle Computing Lab",
    frameLabel: "COLL/CSCI 100 course website",
    caption: "The COLL/CSCI 100: Physical Intelligence: Robots course website",
    link: { href: "https://roboworld314.github.io/VC_Lab/", label: "Visit the course website" }
  },
  {
    date: "Oct 2026",
    tag: "Service",
    title: "Reviewer for EdgeCAV'26 at ACM/IEEE SEC'26",
    image: "assets/news/2026-10-edgecav26-flyer.jpg",
    position: "top",
    alt: "EdgeCAV 2026 call-for-papers flyer: ACM/IEEE International Workshop on Edge Computing for Connected and Autonomous Vehicles, Santa Clara University, October 16, 2026",
    caption: "EdgeCAV 2026 call for papers, ACM/IEEE SEC'26, Santa Clara University",
    text: "Reviewed papers for the 2nd ACM/IEEE International Workshop on Edge Computing for Connected and Autonomous Vehicles, held with ACM/IEEE SEC'26 at Santa Clara University on October 16, 2026.",
    link: { href: "https://sidilu.org/workshop/EdgeCAV_2026.html", label: "Visit the workshop website" }
  },
  {
    date: "May 2026",
    tag: "Paper",
    title: "“Log What Matters” published at IEEE MOST 2026 in Detroit",
    text: "Our safety-aware adaptive logging framework for connected and autonomous vehicles. I also received a student travel grant, and our TinyLite paper appeared at the PISA workshop.",
    image: "assets/img/research/caal-pipeline.png",
    fit: "contain",
    alt: "Diagram of the CAAL-VLM adaptive logging pipeline",
    link: { href: "https://sidilu.org/paper/AdaptiveLogAsInput_MOST26.pdf", label: "Read the paper" }
  },
  {
    date: "2025",
    tag: "Paper",
    title: "“Context-Aware Perception” published at ACM/IEEE SEC'25",
    text: "Vision-language models for all-weather object detection in autonomous driving, presented in Arlington, VA, with a student travel grant.",
    cover: { title: "SEC'25", sub: "ACM/IEEE Symposium on Edge Computing" },
    link: { href: "https://doi.org/10.1145/3769102.3774638", label: "Read the paper" }
  }
];
