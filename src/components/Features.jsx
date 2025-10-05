import { motion } from 'framer-motion';

const features = [
  {
    title: "Satellite Monitoring",
    description: "Real-time monitoring of crop health using advanced satellite imagery",
    icon: "🛰️"
  },
  {
    title: "Smart Recommendations",
    description: "AI-powered insights for optimal farming decisions",
    icon: "🤖"
  },
  {
    title: "Weather Integration",
    description: "Accurate weather forecasting for better planning",
    icon: "🌤️"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 50 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}