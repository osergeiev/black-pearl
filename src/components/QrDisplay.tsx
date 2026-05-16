'use client';
import { QRCodeSVG } from 'qrcode.react';

export function QrDisplay({ value, size = 200 }: { value: string; size?: number }) {
  return <QRCodeSVG value={value} size={size} level="L" />;
}
