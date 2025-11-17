import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Button, Card, ListItem, styled } from '@mui/material';

export const MotionButton = styled(Button)``;
export const MotionCard = styled(Card)``;
export const MotionListItem = styled(ListItem)``;

export const MotionButtonComponent = motion(MotionButton);
export const MotionCardComponent = motion(MotionCard);
export const MotionListItemComponent = motion(MotionListItem);

// Types for the motion components
export type MotionButtonProps = typeof MotionButtonComponent;
export type MotionCardProps = typeof MotionCardComponent;
export type MotionListItemProps = typeof MotionListItemComponent; 