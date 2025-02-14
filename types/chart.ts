export interface ExpandableCardProps {
  summary: string;
  details: string;
}

export interface MessageDistributionData {
    numMessages: number;
    numConversations: number;
}
  
export interface MessageDistributionChartProps {
    data: MessageDistributionData[];
}

export interface AnnotatedDistributionData {
    username: string;
    numAnnotated: number;
    numInProgress: number;
    numNotAnnotated: number;
}

export interface AnnotatedDistributionChartProps {
    data: AnnotatedDistributionData[];
}

export interface AnnotatedLabelAnnotationData {
    label: string,
    numsAnnotated: number,
    numsNotAnnotated: number
}

export interface AnnotatedLabelAnnotationChartProps {
    data: AnnotatedLabelAnnotationData[];
}

export interface HeatMapConversationData {
    day: number;
    hour: number;
    count: number;
}

export interface HeatMapConversationChartProps {
    data: HeatMapConversationData[];
}