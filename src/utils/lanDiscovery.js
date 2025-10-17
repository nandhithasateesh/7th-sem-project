// LAN Discovery utilities for finding nearby devices

export const discoverDevices = async () => {
  // Simulate LAN device discovery
  // In production, this would use WebRTC or a discovery server
  
  const mockDevices = [
    {
      id: 'device-1',
      name: 'Desktop-PC',
      ip: '192.168.1.100',
      status: 'online',
      lastSeen: new Date().toISOString()
    },
    {
      id: 'device-2',
      name: 'Laptop-Work',
      ip: '192.168.1.101',
      status: 'online',
      lastSeen: new Date().toISOString()
    }
  ];
  
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockDevices), 1000);
  });
};

export const getLocalIP = async () => {
  // Get local IP address using WebRTC
  return new Promise((resolve) => {
    const pc = new RTCPeerConnection({ iceServers: [] });
    pc.createDataChannel('');
    
    pc.createOffer().then(offer => pc.setLocalDescription(offer));
    
    pc.onicecandidate = (ice) => {
      if (!ice || !ice.candidate || !ice.candidate.candidate) {
        pc.close();
        return;
      }
      
      const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
      const match = ipRegex.exec(ice.candidate.candidate);
      
      if (match) {
        resolve(match[1]);
        pc.close();
      }
    };
  });
};

export const optimizeBandwidth = (fileSize) => {
  // Calculate optimal chunk size for file transfer
  const MB = 1024 * 1024;
  
  if (fileSize < MB) {
    return { chunkSize: 64 * 1024, chunks: Math.ceil(fileSize / (64 * 1024)) };
  } else if (fileSize < 10 * MB) {
    return { chunkSize: 256 * 1024, chunks: Math.ceil(fileSize / (256 * 1024)) };
  } else {
    return { chunkSize: 1 * MB, chunks: Math.ceil(fileSize / MB) };
  }
};

export const estimateTransferTime = (fileSize, bandwidth = 100) => {
  // Estimate transfer time in seconds
  // bandwidth in Mbps (default 100 Mbps for LAN)
  const bitsPerSecond = bandwidth * 1000000;
  const bytesPerSecond = bitsPerSecond / 8;
  const seconds = fileSize / bytesPerSecond;
  
  return {
    seconds: Math.ceil(seconds),
    formatted: formatTime(seconds)
  };
};

const formatTime = (seconds) => {
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = Math.ceil(seconds % 60);
  return `${minutes}m ${secs}s`;
};

export const pingDevice = async (deviceId) => {
  // Simulate ping to check device availability
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        deviceId,
        latency: Math.floor(Math.random() * 50) + 1, // 1-50ms
        status: 'reachable'
      });
    }, 100);
  });
};
