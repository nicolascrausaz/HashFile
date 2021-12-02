/// <reference lib="webworker" />

import * as asmCrypto from "asmcrypto.js/asmcrypto.all";


const FILESIZE: number = 1000000000; // 1GB
const CHUNKSIZE: number = Math.pow(2, 28); //Best result found

addEventListener('message', ({ data }) => {
  console.log("Worker created");
  let file = data?.file;
  if (file) file.size < FILESIZE ? hashSmallFile(file) : hashBigFile(file);
});

/**
 * This function hashes file using CryptoWeb
 */
function hashSmallFile(file: File) {
  // Start counter
  var startTime = performance.now()

  let chunk_size = FILESIZE;
  let offset = 0;

  let reader = new FileReader();

  reader.onload = async (e) => {
    if (reader.readyState == FileReader.DONE) {
      let uint8_data = new Uint8Array(<ArrayBuffer>e.target.result);

      const hashCrypto = await crypto.subtle.digest('SHA-256', uint8_data); // hash file in one time with Javascript Crypto Web API
      const hashArray = Array.from(new Uint8Array(hashCrypto));  // convert buffer in octet array
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert byte to hex

      postMessage({ hash: hashHex, done: true });

      // Stop counter
      var endTime = performance.now()
      console.log(`Hash the file took ${endTime - startTime} milliseconds (small file)`)

      return;

    }
  };
  // First call we get 0, chunck_size
  reader.readAsArrayBuffer(file.slice(offset, offset + chunk_size));


}

/**
 * This function hashes file using ASMCrypto.js
 */
function hashBigFile(file: File) {
  // Start counter
  var startTime = performance.now()

  let hasher = new asmCrypto.SHA256();
  let size = file.size;
  let chunk_size = CHUNKSIZE;
  let offset = 0;

  let reader = new FileReader();

  reader.onload = (e) => {
    if (reader.readyState == FileReader.DONE) {
      // Hash with sha256 from asmCrypto
      let uint8_data = new Uint8Array(<ArrayBuffer>e.target.result);
      hasher.process(uint8_data);  //Hash the partial file

      if (offset < size) {
        // Update offset for next slice
        offset += chunk_size;
        reader.readAsArrayBuffer(file.slice(offset, offset + chunk_size));
        postMessage({ hash: Math.round((offset / size * 100)) + "/100%", done: false });
      } else {
        // If we are done, finalize the hash with all hash
        hasher.finish();
        let hashHex = bytes_to_hex(hasher.result)
        postMessage({ hash: hashHex, done: true });

        // Stop counter
        var endTime = performance.now()
        console.log(`Hash the file took ${endTime - startTime} milliseconds (large file)`);

        return;
      }
    }
  };
  // First call we get 0, chunck_size
  reader.readAsArrayBuffer(file.slice(offset, offset + chunk_size));

}

// Private methode to convert ann Uint8Array of byte to a string of hexadecimal values
function bytes_to_hex(arr: Uint8Array) {
  var str = '';
  for (var i = 0; i < arr.length; i++) {
    var h = (arr[i] & 0xff).toString(16);
    if (h.length < 2) str += '0';
    str += h;
  }
  return str;
}