
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  Upload, 
  Check, 
  Wallet
} from "lucide-react";

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: any; 
  title: string; 
  description: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="p-6 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
  >
    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-accent" />
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Upload,
      title: "Document Assets",
      description: "Upload videos and LiDAR scans of your assets securely."
    },
    {
      icon: Check,
      title: "Validate",
      description: "Get your assets validated by certified XMRT validators."
    },
    {
      icon: Wallet,
      title: "Tokenize",
      description: "Convert your validated assets into blockchain tokens."
    }
  ];

  return (
    <AppLayout>
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-accent to-purple-600 bg-clip-text text-transparent"
          >
            Tokenize Your Assets with Confidence
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 mb-8"
          >
            Document, validate, and tokenize your assets on the blockchain with our
            secure and intuitive platform.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button 
              size="lg" 
              onClick={() => navigate("/upload")}
              className="bg-accent hover:bg-accent/90"
            >
              Start Tokenizing
            </Button>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </section>
    </AppLayout>
  );
};

export default Index;
