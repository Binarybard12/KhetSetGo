import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { motion } from 'framer-motion';

function Torus() {
  return (
    <Float speed={1.5} rotationIntensity={2} floatIntensity={2}>
      <mesh>
        <torusGeometry args={[8, 2, 16, 100]} />
        <meshPhongMaterial wireframe color="#22c55e" />
      </mesh>
    </Float>
  );
}

export default function Hero() {
  return (
    <div className="relative h-screen flex items-center">
      <div className="absolute inset-0">
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Torus />
          <OrbitControls enableZoom={false} />
        </Canvas>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Empowering Farmers with Technology
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Advanced satellite monitoring and AI-powered recommendations for modern agriculture
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all"
            onClick={() => setCurrentPage('dashboard')}
          >
            Get Started →
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}