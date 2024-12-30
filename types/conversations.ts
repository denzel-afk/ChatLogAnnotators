export interface Message {
    role: string;
    content: string;
    annotations?: Annotation[]
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
  
  export interface ModalProps {
    title: string;
    isOpen: boolean;
    children: React.ReactNode;
    onSave: () => void;
    onClose: () => void;
  }