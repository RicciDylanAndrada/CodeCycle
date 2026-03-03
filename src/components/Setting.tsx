"use client";
import React from 'react';
import { DownOutlined, SmileOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Space } from 'antd';
import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { CardContent } from './ui/card';

interface Settings {
  dailyGoal: number;
  maxNewPerDay: number;
  defaultInterval: number;
}

const Setting = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
      const fetchData = async () => {
        try {
          const [settingsRes] = await Promise.all([
            fetch("/api/review/settings"),
          ]);
  
          const [settingsData] = await Promise.all([
            settingsRes.json(),
          ]);
  
          setSettings(settingsData);
        } catch {
          setError("Failed to load dashboard");
        } 
      };
  
      fetchData();
    }, []);
 const handleUpdateSettings = async (field: string, value: number) => {
    try {
      const res = await fetch("/api/review/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
      }
    } catch {
      setError("Failed to update settings");
    }
  };

const items: MenuProps['items'] = [
  {
    key: '1',
    label: (
      <div className="space-y-3" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between">
          <Label>Daily Goal</Label>
          <span className="text-sm text-muted-foreground">{settings?.dailyGoal ?? 0} problems</span>
        </div>
        <Slider
          value={[settings?.dailyGoal ?? 0]}
          min={3}
          max={15}
          step={1}
          onValueCommit={value => handleUpdateSettings("dailyGoal", value[0])}
        />
      </div>
    ),
  },
  {
    key: '2',
    label: (
      <div className="space-y-3" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between">
          <Label>Max New Per Day</Label>
          <span className="text-sm text-muted-foreground">{settings?.maxNewPerDay ?? 0} problems</span>
        </div>
        <Slider
          value={[settings?.maxNewPerDay ?? 0]}
          min={1}
          max={10}
          step={1}
          onValueCommit={value => handleUpdateSettings("maxNewPerDay", value[0])}
        />
      </div>
    ),
    icon: <SmileOutlined />,
  },
  {
    key: '3',
    label: (
      <CardContent className="space-y-3">
      <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Default Interval</Label>
                  <span className="text-sm text-muted-foreground">{settings?.defaultInterval ?? 0} days</span>
                </div>
                <Slider
                  value={[settings?.defaultInterval ?? 0]}
                  min={3}
                  max={14}
                  step={1}
                  onValueCommit={value => handleUpdateSettings("defaultInterval", value[0])}
                />
              </div>
              </CardContent>
    ),
  },
];

return (
  <Dropdown menu={{ items }}>
    <a onClick={(e) => e.preventDefault()}>
      <Space>
        Settings
        <DownOutlined />
      </Space>
    </a>
  </Dropdown>
);
};

export default Setting;