import { useState } from 'react';
import { Upload, Button, Card } from 'antd';
import { UploadChangeParam } from 'antd/lib/upload/interface';
import 'antd/dist/antd.css';
import './App.css';

function App() {
  const [svgs, setSvgs] = useState<string[]>([]);

  const handleChange = async ({ file }: UploadChangeParam) => {
    console.log(file);
    const svg = (await file.originFileObj?.text()) ?? '';
    setSvgs([...svgs, svg]);
  };

  return (
    <div style={{ margin: 50 }}>
      <Upload name="file" showUploadList={false} onChange={handleChange}>
        <Button>Upload</Button>
      </Upload>
      <Card style={{ marginTop: 20 }}>
        {svgs.map((svgXml) => {
          return (
            <div
              className="icon-containner"
              dangerouslySetInnerHTML={{ __html: svgXml }}
            ></div>
          );
        })}
      </Card>
    </div>
  );
}

export default App;
