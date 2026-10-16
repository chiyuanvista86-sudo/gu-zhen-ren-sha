/** Use Android's document picker for exports; browsers keep the usual download. */
export function download(name: string, text: string, type = 'text/markdown;charset=utf-8') {
  const bridge = (window as Window & {
    GuAndroid?: { exportFile(name: string, text: string, mime: string): void };
  }).GuAndroid;
  if (bridge && location.origin === 'https://appassets.androidplatform.net') {
    bridge.exportFile(name, text, type.split(';')[0]);
    return;
  }
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
