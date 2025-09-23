
import React from 'react';

const TrueFooter: React.FC = () => {
  const deploymentDate = new Date().toLocaleDateString('zh-CN');

  return (
    <footer className="w-full mt-auto pt-8 pb-4 mb-20">
      <div className="max-w-5xl mx-auto px-4 text-center text-xs text-[var(--color-text-muted)]">
        <div className="flex justify-center items-center mb-4">
          <img 
            src="https://docs.bccsw.cn/images/const-yeqian/headlogo.png" 
            alt="叶倩倩的美学小屋 Logo"
            className="h-10 w-10 rounded-full object-cover"
          />
        </div>
        <p>
          Copyright © 2025 叶倩倩的美学小屋. All Rights Reserved.
        </p>
        <p className="mt-1">
          <span>重庆联合丽格科技有限公司</span>
          <span className="mx-2" aria-hidden="true">|</span>
          <a 
            href="https://beian.miit.gov.cn/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-[var(--color-primary)] transition-colors"
          >
            渝 ICP 备 2024023473 号
          </a>
        </p>
        <p className="mt-1">
          <span>版本号 0.5.7</span>
          <span className="mx-2" aria-hidden="true">|</span>
          <span>部署时间：{deploymentDate}</span>
        </p>
      </div>
    </footer>
  );
};

export default TrueFooter;