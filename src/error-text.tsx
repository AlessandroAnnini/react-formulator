import React from 'react';

interface ErrorTextProps {
  children: string;
}

const style = {
  error: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'red',
  } as React.CSSProperties,
};

export const ErrorText: React.FC<React.PropsWithChildren<ErrorTextProps>> = ({
  children,
}) => <p style={style.error}>{children}</p>;
