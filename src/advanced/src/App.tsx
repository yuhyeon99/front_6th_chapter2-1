import Header from './components/Header';
import Layout from './components/Layout';
import Selector from './components/Selector';
import HelpModal from './components/HelpModal';

function App() {
  const handleAdd = () => {
    console.log('Add to cart clicked!');
  };

  return (
    <Layout>
      <Header itemCount={0} />
      <Selector onAdd={handleAdd} />
      <HelpModal />
    </Layout>
  );
}

export default App;
