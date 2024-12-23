export interface Message {
    role: string;
    content: string;
  }
  
  export interface Annotation {
    _id: string;
    title: string;
    type: string;
    options?: string[];
    answers: string[] | null;
  }
  
  export interface Conversation {
    _id: string;
    stime: {
      text: string;
      timestamp: number;
    };
    messages: Message[];
    annotations?: Annotation[];
    last_interact: {
      text: string;
      timestamp: number;
    };
    person: string;
  }
  