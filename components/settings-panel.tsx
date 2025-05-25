"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Monitor, Volume2, Gamepad2, Palette } from "lucide-react"
import type { GameSettings } from "../types/game"

interface SettingsPanelProps {
  settings: GameSettings
  onUpdateSettings: (settings: Partial<GameSettings>) => void
  onClose: () => void
}

export default function SettingsPanel({ settings, onUpdateSettings, onClose }: SettingsPanelProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Graphics Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Graphics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Graphics Quality</Label>
                <Select
                  value={settings.graphics.quality}
                  onValueChange={(value) =>
                    onUpdateSettings({
                      graphics: { ...settings.graphics, quality: value as any },
                    })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="ultra">Ultra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Resolution</Label>
                <Select
                  value={settings.graphics.resolution}
                  onValueChange={(value) =>
                    onUpdateSettings({
                      graphics: { ...settings.graphics, resolution: value },
                    })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1280x720">1280x720</SelectItem>
                    <SelectItem value="1920x1080">1920x1080</SelectItem>
                    <SelectItem value="2560x1440">2560x1440</SelectItem>
                    <SelectItem value="3840x2160">3840x2160</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Fullscreen</Label>
                <Switch
                  checked={settings.graphics.fullscreen}
                  onCheckedChange={(checked) =>
                    onUpdateSettings({
                      graphics: { ...settings.graphics, fullscreen: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">V-Sync</Label>
                <Switch
                  checked={settings.graphics.vsync}
                  onCheckedChange={(checked) =>
                    onUpdateSettings({
                      graphics: { ...settings.graphics, vsync: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Shadows</Label>
                <Switch
                  checked={settings.graphics.shadows}
                  onCheckedChange={(checked) =>
                    onUpdateSettings({
                      graphics: { ...settings.graphics, shadows: checked },
                    })
                  }
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Render Distance: {settings.graphics.renderDistance}</Label>
                <Slider
                  value={[settings.graphics.renderDistance]}
                  onValueChange={([value]) =>
                    onUpdateSettings({
                      graphics: { ...settings.graphics, renderDistance: value },
                    })
                  }
                  min={50}
                  max={200}
                  step={10}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Audio Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Audio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Master Volume: {settings.audio.masterVolume}%</Label>
                <Slider
                  value={[settings.audio.masterVolume]}
                  onValueChange={([value]) =>
                    onUpdateSettings({
                      audio: { ...settings.audio, masterVolume: value },
                    })
                  }
                  min={0}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Music Volume: {settings.audio.musicVolume}%</Label>
                <Slider
                  value={[settings.audio.musicVolume]}
                  onValueChange={([value]) =>
                    onUpdateSettings({
                      audio: { ...settings.audio, musicVolume: value },
                    })
                  }
                  min={0}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">SFX Volume: {settings.audio.sfxVolume}%</Label>
                <Slider
                  value={[settings.audio.sfxVolume]}
                  onValueChange={([value]) =>
                    onUpdateSettings({
                      audio: { ...settings.audio, sfxVolume: value },
                    })
                  }
                  min={0}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Engine Sounds</Label>
                <Switch
                  checked={settings.audio.engineSounds}
                  onCheckedChange={(checked) =>
                    onUpdateSettings({
                      audio: { ...settings.audio, engineSounds: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Ambient Sounds</Label>
                <Switch
                  checked={settings.audio.ambientSounds}
                  onCheckedChange={(checked) =>
                    onUpdateSettings({
                      audio: { ...settings.audio, ambientSounds: checked },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Controls Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5" />
                Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Control Scheme</Label>
                <Select
                  value={settings.controls.scheme}
                  onValueChange={(value) =>
                    onUpdateSettings({
                      controls: { ...settings.controls, scheme: value as any },
                    })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wasd">WASD</SelectItem>
                    <SelectItem value="arrows">Arrow Keys</SelectItem>
                    <SelectItem value="gamepad">Gamepad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Steering Sensitivity: {settings.controls.sensitivity}</Label>
                <Slider
                  value={[settings.controls.sensitivity]}
                  onValueChange={([value]) =>
                    onUpdateSettings({
                      controls: { ...settings.controls, sensitivity: value },
                    })
                  }
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Auto-Brake</Label>
                <Switch
                  checked={settings.controls.autoBrake}
                  onCheckedChange={(checked) =>
                    onUpdateSettings({
                      controls: { ...settings.controls, autoBrake: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Traction Control</Label>
                <Switch
                  checked={settings.controls.tractionControl}
                  onCheckedChange={(checked) =>
                    onUpdateSettings({
                      controls: { ...settings.controls, tractionControl: checked },
                    })
                  }
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Key Bindings</Label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Accelerate:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">W / ↑</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Brake:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">S / ↓</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Turn Left:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">A / ←</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Turn Right:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">D / →</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gameplay Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Gameplay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Difficulty</Label>
                <Select
                  value={settings.gameplay.difficulty}
                  onValueChange={(value) =>
                    onUpdateSettings({
                      gameplay: { ...settings.gameplay, difficulty: value as any },
                    })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Camera View</Label>
                <Select
                  value={settings.gameplay.cameraView}
                  onValueChange={(value) =>
                    onUpdateSettings({
                      gameplay: { ...settings.gameplay, cameraView: value as any },
                    })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="third-person">Third Person</SelectItem>
                    <SelectItem value="first-person">First Person</SelectItem>
                    <SelectItem value="top-down">Top Down</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Show Minimap</Label>
                <Switch
                  checked={settings.gameplay.showMinimap}
                  onCheckedChange={(checked) =>
                    onUpdateSettings({
                      gameplay: { ...settings.gameplay, showMinimap: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Show Speedometer</Label>
                <Switch
                  checked={settings.gameplay.showSpeedometer}
                  onCheckedChange={(checked) =>
                    onUpdateSettings({
                      gameplay: { ...settings.gameplay, showSpeedometer: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Ghost Cars</Label>
                <Switch
                  checked={settings.gameplay.ghostCars}
                  onCheckedChange={(checked) =>
                    onUpdateSettings({
                      gameplay: { ...settings.gameplay, ghostCars: checked },
                    })
                  }
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Race Length</Label>
                <Select
                  value={settings.gameplay.raceLength}
                  onValueChange={(value) =>
                    onUpdateSettings({
                      gameplay: { ...settings.gameplay, raceLength: value as any },
                    })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (3 laps)</SelectItem>
                    <SelectItem value="medium">Medium (5 laps)</SelectItem>
                    <SelectItem value="long">Long (10 laps)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center">
          <Button onClick={onClose} size="lg" className="bg-blue-600 hover:bg-blue-700">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
