import { useState } from 'react';
import { Upload, Button, Card, message } from 'antd';
import 'antd/dist/antd.css';
import { RcFile } from 'antd/lib/upload/interface';
import { RedoOutlined } from '@ant-design/icons';
import { getRandomStr, serializeParams } from './utils';
import './App.css';

interface SvgContent {
  id: string;
  svg: string;
  file: File;
}

interface UploadParams {
  cleanColor?: boolean;
}

function App() {
  const [svgs, setSvgs] = useState<SvgContent[]>([]);
  const [spinning, setSpinning] = useState(false);

  const handleChange = async (file: RcFile, files: RcFile[]) => {
    const svg = await file.text();
    const id = getRandomStr(5);
    setSvgs([
      ...svgs,
      {
        id,
        svg,
        file,
      },
    ]);
    return false;
  };

  const handleUpload = async (uploadParams?: UploadParams) => {
    const formData = new FormData();
    svgs.forEach(({ file }) => formData.append('file', file));
    let uploadUrl = '/api/upload';
    if (uploadParams?.cleanColor) {
      uploadUrl += `?${serializeParams({
        cleanColor: 'true',
      })}`;
    }
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (uploadRes.ok) {
      message.success('上传成功');
    }
  };

  const getUploadedSvg = async () => {
    setSpinning(true);
    const result = await fetch('/api/svg', {
      method: 'GET',
    });
    setSpinning(false);
    console.log(result);
  };

  return (
    <div style={{ margin: 50 }}>
      <Card title="上传文件">
        <Upload name="file" showUploadList={false} beforeUpload={handleChange}>
          <Button>选择文件</Button>
        </Upload>
        {svgs.length ? (
          <>
            <Card style={{ marginTop: 20 }}>
              {svgs.map((item) => {
                return (
                  <div
                    key={item.id}
                    className="icon-containner"
                    dangerouslySetInnerHTML={{ __html: item.svg }}
                  ></div>
                );
              })}
            </Card>
            <div style={{ marginTop: 20 }}>
              <Button type="primary" onClick={() => handleUpload()}>
                上传
              </Button>
              <Button
                type="primary"
                onClick={() => handleUpload({ cleanColor: true })}
                style={{ marginLeft: 24 }}
              >
                清除颜色上传
              </Button>
            </div>
          </>
        ) : null}
      </Card>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: 12 }}>已上传的图标显示</span>
            <a onClick={getUploadedSvg}>
              <RedoOutlined spin={spinning} />
            </a>
          </div>
        }
        style={{ marginTop: 24 }}
      >
        测试
      </Card>
    </div>
  );
}

export default App;
