import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import mePhoto from "@/assets/me.jpeg";
import ThemeToggle from "@/components/ThemeToggle";

const linkify = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+|(?:[a-zA-Z0-9-]+\.)+(?:com|org|net|dev|io|app|in|co)(?:\/[^\s]*)?|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const singleLinkRegex = /^(https?:\/\/[^\s]+|(?:[a-zA-Z0-9-]+\.)+(?:com|org|net|dev|io|app|in|co)(?:\/[^\s]*)?|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (!singleLinkRegex.test(part)) return part;

    if (part.includes("@") && !part.startsWith("http")) {
      return (
        <a key={i} href={`mailto:${part}`} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity">
          {part}
        </a>
      );
    }

    const href = part.startsWith("http") ? part : `https://${part}`;
    const shortText = part.replace(/^https?:\/\//, "");
    const displayText = shortText.length > 52 ? `${shortText.slice(0, 49)}...` : shortText;

    return (
      <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity break-words">
        {displayText}
      </a>
    );
  });
};

interface Message {
  role: "bot" | "user";
  text: string;
}

const chatData: Record<string, { initial: string; answer: string; followUps: { q: string; a: string }[] }> = {
  about: {
    initial: "Who are you?",
    answer:
      "My name is Devyani Ghildiyal. I currently live in Noida, Uttar Pradesh. I am a Computer Science student with a keen interest in Artificial Intelligence and Machine Learning ✨",
    followUps: [
      { q: "Where are you from?", a: "I'm originally from Dehradun, Uttarakhand." },
      { q: "What drives you?", a: "What drives me is my curiosity to learn new technologies and understand how things work, especially in the field of AI and machine learning. I enjoy solving problems and building projects that turn ideas into real, practical solutions." },
      { q: "When did you started to code?", a: "I first got started in tech back in 5th grade during my computer science class in school. We were introduced to Scratch, where we learned how to build simple games and animations. Creating games there really sparked my interest, which gradually grew into a deeper curiosity about computers and technology." },
      { q: "What are your education qualifications?", a: "I completed my schooling from Delhi Public School, RK Puram, and I am currently pursuing my final year of B.Tech in Computer Science and Engineering at Manipal University Jaipur, with a minor specialization in Data Analytics." },
      { q: "What work experience do you have?", a: "I worked as a Data Analyst Intern at Powercon Ventures India Pvt. Ltd., Pune, from May 2025 to July 2025. During my internship, I worked on renewable energy and wind turbine data analysis, where I analyzed SCADA data and DLB reports to calculate key turbine KPIs such as PLF, MTTR, and MTBF. I also helped automate fault-tracking dashboards using Python and Power BI to reduce manual reporting efforts. Additionally, I contributed to the development of an AI-powered operator chatbot by integrating NLP techniques with SCADA signals to support real-time monitoring and improve fault analysis workflows." },
    ],
  },
  projects: {
    initial: "What are your projects?",
    answer:
      "I've worked on a range of projects spanning AI/ML, cybersecurity, and full-stack development. Here are some highlights! 🚀\n\n1. Cyber Shield - ML-powered cybersecurity browser extension for detecting unsafe browsing patterns.\n🔗 github.com/devyanighildiyal/Team101\n\n2. Deepfake Detection System - Deep learning system using XceptionNet & CNN-LSTM-Attention on Celeb-DF dataset.\n🔗 github.com/devyanighildiyal/minor_project_deep_fake\n\n3. Helper MS (Google Girl Hackathon) - Full-stack HRMS platform with REST APIs for resume processing & onboarding.\n🔗 github.com/devyanighildiyal/Google-Girl-Hackathon_SWE_2025",
    followUps: [
      { q: "Tell me more projects!", a: "4. AI-Powered Invoice & PO Verification (Futurix AI) - Automatically verifies invoices against purchase orders to detect mismatches.\n🔗 github.com/devyanighildiyal/AI-Powered-Invoice-and-Purchase-Order-Verification-Futurix-AI-\n\n5. KPI Agentic Intelligence - An agentic AI system that analyzes datasets and computes KPIs for data-driven decisions.\n🔗 github.com/devyanighildiyal/kpi-agentic-intelligence" },
      { q: "Any ongoing project?", a: "Yes, I am currently working on an ongoing project on Industrial Surface Defect Detection. It focuses on building a computer vision-based system using deep learning models such as lightweight CNNs and Vision Transformers to automatically detect defects on metal surfaces. The goal is to improve quality inspection in manufacturing by making defect detection faster, more accurate, and suitable for real-time industrial applications. 🔬" },
      { q: "What's your favorite project?", a: "Helper MS is my favorite project because it combined problem-solving with real-world impact while pushing me outside my comfort zone. Built during Google Girl Hackathon 2025, the platform focused on simplifying HR workflows through resume processing and onboarding automation. What made this project especially memorable was the environment, competing individually against participants from across India, working under pressure, and building within a strict 2-day timeline. I worked on designing scalable features, optimizing APIs, and creating a modular architecture. Beyond the project itself, the hackathon also gave me the opportunity to connect with an inspiring community of developers and mentors, making the experience both technically challenging and personally rewarding. 🎯" },
      { q: "Any team projects?", a: "Yes, one of my main team projects is Cyber Shield, which I built with a team of three members. I was the team leader, and we developed it as a cybersecurity browser extension that helps detect unsafe patterns and improve online safety. We submitted this project to Hack-O-Mania, IIT Ropar's annual hackathon, where our team secured 2nd place among 150+ competing teams, which was a very rewarding experience. 🚀" },
    ],
  },
  skills: {
    initial: "What are your skills?",
    answer:
      "My skills include programming languages such as Python, Java, C, SQL, HTML, CSS, and JavaScript. I have experience in machine learning and deep learning, working with models like CNNs, LSTMs, Transformers, GANs, and Attention-based architectures. I also have full-stack development experience, where I've built applications using React for the frontend and REST APIs with backend frameworks, along with handling databases and system architecture. Additionally, I work with tools such as TensorFlow, Scikit-learn, NumPy, Pandas, Power BI, and Git, and have strong fundamentals in data structures and algorithms, object-oriented programming, data pipelines, and model deployment.",
    followUps: [
      { q: "Can you share your resume?", a: "Sure! You can view or download my resume here:\n🔗 /Devyani_Ghildiyal_Resume.pdf" },
    ],
  },
  fun: {
    initial: "What are your hobbies?",
    answer:
      "My hobbies include exploring new technologies and learning about advancements in AI and software development. I also enjoy dancing, singing, and photography, and have a strong interest in creative and performing arts.🎶💃📷💻",
    followUps: [
      { q: "What dance do you perform?", a: "I perform Bharatanatyam, a classical Indian dance form, and I have been practicing it for over 11 years. Along with that, I also enjoy exploring and performing various other dance styles. If anyone ever wants to collaborate on dance projects or performances, feel free to reach out! 💃✨" },
      { q: "Favorite show?", a: "My favorite shows are Brooklyn Nine-Nine and Frieren: Beyond Journey's End." },
      { q: "Do you game?", a: "Yes, I do play games. I usually play Mobile Legends, Legend of Ace, League of Legends, Roblox, and Smash Karts😄" },
      { q: "Music taste?", a: "My music taste is honestly all over the place. I listen to K-pop, Bollywood music, Garhwali songs, Little Mix, and Sabrina Carpenter, and I also enjoy devotional music, so it's a pretty wide range depending on my mood. 🎶" },
      { q: "Travel?", a: "I love to travel. Being a Pahadi (someone from the mountains), I especially love traveling to the mountains. The peace and quiet, along with the beautiful views and cool weather, just make it feel like heaven. 🏔️✨" },
      { q: "What's the craziest travel story you have?", a: "One of my craziest travel experiences was trekking to Kedarnath. I completed a 21 km trek to an altitude of around 3,600 meters in October, when the temperature had dropped to about –5°C. The last two kilometers were extremely tough because the cold air made it feel like my lungs were freezing and I could barely breathe. But the moment I finally reached the Kedarnath temple and stood in front of it, all the exhaustion disappeared and it felt like the entire journey was completely worth it. ✨" },
    ],
  },
  contact: {
    initial: "How to reach you?",
    answer:
      "You can reach me via email, LinkedIn, or GitHub. I'm always open to connecting and collaborating! 📬\n\n• Email: devyanighildiyal07@gmail.com\n• LinkedIn: linkedin.com/in/devyani-ghildiyal\n• GitHub: github.com/devyanighildiyal",
    followUps: [
      { q: "Best way to reach you?", a: "The best way to reach me is through email or LinkedIn. If you happen to have my phone number, then that's probably the easiest way to contact me. 😊" },
      { q: "Social media?", a: "You can find me on Twitter and Instagram too!\n\n• Instagram: instagram.com/devyanighildiyal\n• Twitter: x.com/heyItsDevyani" },
      { q: "Do you freelance?", a: "Yes, I do. I'm open to freelance projects, collaborations, and interesting tech opportunities. 😊" },
    ],
  },
};

const ChatPage = () => {
  const { topic } = useParams<{ topic: string }>();
  const navigate = useNavigate();
  const data = chatData[topic || ""] || chatData.about;
  const [messages, setMessages] = useState<Message[]>([]);
  const [availableQs, setAvailableQs] = useState<{ q: string; a: string }[]>([]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset on topic change
    setMessages([]);
    setAvailableQs([]);
    setTyping(false);

    const t1 = setTimeout(() => {
      setMessages([{ role: "user", text: data.initial }]);
      setTyping(true);
    }, 300);

    const t2 = setTimeout(() => {
      setMessages((prev) => [...prev, { role: "bot", text: data.answer }]);
      setAvailableQs(data.followUps);
      setTyping(false);
    }, 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [topic]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleQuestion = (q: string, a: string) => {
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setAvailableQs((prev) => prev.filter((item) => item.q !== q));
    setTyping(true);

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "bot", text: a }]);
      setTyping(false);
    }, 1000);
  };

  const topicLabels: Record<string, string> = {
    about: "About Me",
    projects: "Projects",
    skills: "Skills",
    fun: "Fun",
    contact: "Contact",
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ThemeToggle />
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-md">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Go home"
        >
          <Home className="w-5 h-5 text-primary" />
        </button>
        <h2 className="font-display font-semibold text-foreground text-lg">
          {topicLabels[topic || "about"]}
        </h2>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-2xl mx-auto w-full">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl font-body text-sm leading-relaxed whitespace-pre-line ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-chat-bubble text-foreground rounded-bl-md"
              }`}
            >
              {msg.role === "bot" && i === 1 && topic === "about" ? (
                <div className="flex gap-3 items-start">
                  <img src={mePhoto} alt="Devyani Ghildiyal" className="rounded-xl w-28 sm:w-36 flex-shrink-0 object-cover" />
                  <span>{linkify(msg.text)}</span>
                </div>
              ) : (
                linkify(msg.text)
              )}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-chat-bubble px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {availableQs.length > 0 && (
        <div className="sticky bottom-0 border-t border-border bg-background/90 backdrop-blur-md px-4 py-4">
          <p className="text-xs text-muted-foreground font-mono mb-2 uppercase tracking-wider">Ask me more</p>
          <div className="flex flex-wrap gap-2 max-w-2xl mx-auto">
            {availableQs.map((item) => (
              <button
                key={item.q}
                onClick={() => handleQuestion(item.q, item.a)}
                className="px-4 py-2 text-sm rounded-full border border-border bg-secondary text-foreground font-body hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
              >
                {item.q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
