import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import VisionAssistant from './pages/VisionAssistant.jsx';
import OCRReader from './pages/OCRReader.jsx';
import LiveCaptions from './pages/LiveCaptions.jsx';
import NavigationAssistant from './pages/NavigationAssistant.jsx';
import ARAssistant from './pages/ARAssistant.jsx';

export default function App() {
  console.log("SENSEI APP LOADED");
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vision" element={<VisionAssistant />} />
          <Route path="/ocr" element={<OCRReader />} />
          <Route path="/captions" element={<LiveCaptions />} />
          <Route path="/navigation" element={<NavigationAssistant />} />
          <Route path="/ar" element={<ARAssistant />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
