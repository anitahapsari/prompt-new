
export interface CharacterDetail {
  description: string;
  voice: string;
  action: string;
  expression: string;
  dialogue: string;
}

export interface FormData {
  sceneTitle: string;
  characters: CharacterDetail[];
  setting: string;
  cameraMovement: string;
  lighting: string;
  videoStyle: string;
  overallMood: string;
  ambientSound: string;
  additionalDetails: string;
}

export interface SelectOption {
  value: string;
  label: string;
}
