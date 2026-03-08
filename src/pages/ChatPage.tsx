import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Home, Send } from "lucide-react";

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
      { q: "How did you get started in tech?", a: "I first got started in tech back in 5th grade during my computer science class at Amity. We were introduced to Scratch, where we learned how to build simple games and animations. Creating games there really sparked my interest, which gradually grew into a deeper curiosity about computers and technology." },
      { q: "What are your education qualifications?", a: "I completed my schooling at Amity International School, Noida, where I studied from Nursery to 8th grade. I then attended DPS RK Puram, Delhi for 9th to 12th grade. Currently, I am a fourth-year student at Manipal University Jaipur. 🎓" },
    ],
  },
  projects: {
    initial: "What are your projects?",
    answer:
      "I've worked on a range of projects spanning AI/ML, cybersecurity, and full-stack development. Here are some highlights! 🚀\n\n1. Cyber Shield — ML-powered cybersecurity browser extension for detecting unsafe browsing patterns.\n🔗 github.com/devyanighildiyal/Team101\n\n2. Deepfake Detection System — Deep learning system using XceptionNet & CNN–LSTM–Attention on Celeb-DF dataset.\n🔗 github.com/devyanighildiyal/minor_project_deep_fake\n\n3. Helper MS (Google Girl Hackathon) — Full-stack HRMS platform with REST APIs for resume processing & onboarding.\n🔗 github.com/devyanighildiyal/Google-Girl-Hackathon_SWE_2025",
    followUps: [
      { q: "Tell me more projects!", a: "4. AI-Powered Invoice & PO Verification (Futurix AI) — Automatically verifies invoices against purchase orders to detect mismatches.\n🔗 github.com/devyanighildiyal/AI-Powered-Invoice-and-Purchase-Order-Verification-Futurix-AI-\n\n5. KPI Agentic Intelligence — An agentic AI system that analyzes datasets and computes KPIs for data-driven decisions.\n🔗 github.com/devyanighildiyal/kpi-agentic-intelligence" },
      { q: "Any ongoing project?", a: "The Surface Defect Detection System is an ongoing research project focused on developing an AI-based solution for detecting defects on industrial surfaces using computer vision. The project involves training deep learning models such as lightweight Convolutional Neural Networks (CNNs) and Vision Transformer architectures to accurately identify and classify surface defects like scratches, inclusions, and patches. Using the NEU Surface Defect Dataset, the system analyzes metal surface images to automatically detect defects and assist in quality control within manufacturing environments. The goal of this project is to build an efficient and reliable defect detection system that improves inspection accuracy while supporting real-time industrial applications. 🔬" },
      { q: "What's your favorite project?", a: "The Deepfake Detection System — combining deep learning architectures to solve a real-world problem in media authenticity was both challenging and rewarding! 🎯" },
      { q: "Any team projects?", a: "Yes! Helper MS was built for the Google Girl Hackathon, and Cyber Shield was a team collaboration. Teamwork makes the dream work! 🤝" },
      { q: "What tech do you use?", a: "Python, TensorFlow, PyTorch, React, Node.js, REST APIs, and I'm always exploring new tools and frameworks." },
    ],
  },
  skills: {
    initial: "What are your skills?",
    answer:
      "I'm skilled in React, TypeScript, Tailwind CSS, JavaScript, HTML/CSS, UI/UX Design, and creative coding. I'm always learning and expanding my toolkit! 💡",
    followUps: [
      { q: "What's your strongest skill?", a: "Front-end development — I love crafting pixel-perfect, interactive user interfaces." },
      { q: "Are you learning anything new?", a: "Always! Currently diving deeper into 3D web experiences with Three.js and exploring AI/ML." },
      { q: "Soft skills?", a: "Communication, collaboration, problem-solving, and a good dose of humor to keep things fun! 😄" },
      { q: "Design tools?", a: "Figma is my go-to for design. I also experiment with Framer and creative tools like p5.js." },
    ],
  },
  fun: {
    initial: "What are your hobbies?",
    answer:
      "When I'm not coding, you'll find me sketching, binge-watching sci-fi shows, exploring cafés, or experimenting with creative coding art! 🎨",
    followUps: [
      { q: "Favorite show?", a: "I love sci-fi and mystery — think Black Mirror, Stranger Things, and anything mind-bending! 🍿" },
      { q: "Do you game?", a: "Occasionally! I enjoy puzzle and story-driven games. They're great for creative inspiration." },
      { q: "Music taste?", a: "Very eclectic — from lo-fi beats while coding to Bollywood bangers during breaks! 🎵" },
      { q: "Travel?", a: "I'd love to travel more! Dream destinations include Japan, Iceland, and New Zealand. 🌍" },
    ],
  },
  contact: {
    initial: "How to reach you?",
    answer:
      "You can reach me via email, LinkedIn, or GitHub. I'm always open to connecting and collaborating! 📬\n\n• Email: devyani@example.com\n• LinkedIn: linkedin.com/in/devyani\n• GitHub: github.com/devyani",
    followUps: [
      { q: "Are you open to work?", a: "Yes! I'm always open to exciting opportunities — freelance, full-time, or collaborations. Let's chat! 🤝" },
      { q: "Best way to reach you?", a: "Email is the most reliable way. I usually respond within 24 hours!" },
      { q: "Social media?", a: "You can find me on Twitter and Instagram too — I share my creative work and tech thoughts there." },
      { q: "Do you freelance?", a: "Yes, I take on select freelance projects — especially creative and design-focused ones!" },
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
              {msg.text}
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
