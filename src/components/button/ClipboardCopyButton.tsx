import { useState } from 'react';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { Button } from '@nextui-org/react';

type ClipBoardCopyButtonProps = {
  className?: string;
  text: string;
};

const ClipBoardCopyButton = ({ className, text }: ClipBoardCopyButtonProps) => {
  const [isBodyCopied, setIsBodyCopied] = useState(false);

  const handleCopy = (text: string, setIsCopied: (value: boolean) => void) => {
    copyTextToClipboard(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((error) => console.error(error));
  };

  async function copyTextToClipboard(text: string) {
    return await navigator.clipboard.writeText(text);
  }

  return (
    <Button
      isIconOnly
      className={className}
      onPress={() => handleCopy(text, setIsBodyCopied)}
    >
      {isBodyCopied ? <IconCheck /> : <IconCopy />}
    </Button>
  );
};
export default ClipBoardCopyButton;
