<template>
  <div class="min-h-screen bg-grad flex">
    <div class="main-rect relative m-auto px-4 py-4">
            <p class="text-3xl m-auto text-center" style="font-family: 'Open Sans', sans-serif">
                nMap GUI
            </p>
            <button
    class="text-right underline px-2"
    @click="clearAll()"
  >
    Clear All
  </button>
            <div class="text-center">
                <div class="flex flex-wrap justify-between mt-4">
                    <input v-model="targetField" id="target" name="target" type="text" class="target-text-field" placeholder="Target">
                    <select v-model="selectedScanType" id="scanType" placeholder="Scan type" class="dropdown">
                        <option value="placeholder" disabled selected>Scan type</option>
                        <option value="regular">Regular Scan</option>
                        <option value="quick">Quick Scan</option>
                        <option value="quick-t">Quick Traceroute Scan</option>
                        <option value="intense">Intense Scan</option>
                        <option value="ping">Ping Scan</option>
                        <option value="stealth">Stealth Scan</option>
                        <option value="os">OS Scan</option>
                        <option value="aggressive">Aggressive Scan</option>
                        <option value="port">Port Scan</option>
                        <option value="version">Version Scan</option>
                    </select>
                    <button
                      :disabled="scanning"
                      :class="{
                        'bg-transparent': !scanning,
                        'hover:bg-teal-800': !scanning,
                        'text-green-700': !scanning,
                        'font-semibold': !scanning,
                        'hover:text-white': !scanning,
                        'py-2': !scanning,
                        'px-4': !scanning,
                        'border': !scanning,
                        'border-emerald-700': !scanning,
                        'hover:border-transparent': !scanning,
                        'rounded': !scanning,
                        'opacity-50': scanning,
                        'cursor-not-allowed': scanning,
                        'transition-transform duration-300 transform hover:scale-110': !scanning // Add a scaling effect on hover
                      }"
                      class="py-2 px-4"
                      @click="performScan()"
                    >
                      SCAN
                    </button>
                </div>
                <div>
                    <input v-model="commandField" id="command" class="command-text-field" placeholder="Command">
                </div>
                <!-- NMAP OUTPUT -->
                <div class="text-left mt-4">
                    <p class="text-xl ml-2" style="font-family: 'Sora', sans-serif">
                        Output: <span v-if="scanning" style="font-size: 14px; margin-left:19.5rem;">
                                  Generating<span v-html="loadingDots"></span>
                                </span>
                    </p>
                    <div id="scanResult" class="output-rect p-4 overflow-auto" style="font-family: 'Open Sans', sans-serif" v-html="scanResult">
                    </div>
                </div>
            </div>
        </div>
  </div>
</template>

<script>
import { validateCommandSyntax } from "../validation/commandValidation.js";
export default {
  data() {
    return {
      scanning: false,
      targetField: '',
      selectedScanType: 'placeholder',
      commandField: '',
      updateScanTypeFromCommand: true,
      scanResult: '',
      loadingDots: '',
    };
  },
  computed: {
    fullCommand() {
      const target = this.targetField.trim();
      const scanType = this.selectedScanType === 'placeholder' ? '' : this.selectedScanType;
      return `nmap ${scanType} ${target}`;
    },
  },
  watch: {
    targetField: 'updateCommandField',
    selectedScanType: 'updateCommandField',
    commandField(newVal) {
      if (this.updateScanTypeFromCommand) {
        const scanTypeRegex = /nmap\s+(-[a-zA-Z]+)?\s+/;
        const match = newVal.match(scanTypeRegex);

        if (match && match[1]) {
          const detectedScanType = match[1].trim();
          this.selectedScanType = detectedScanType;
          this.targetField = '';
        } else {
          this.selectedScanType = 'placeholder';
          this.targetField = '';
        }
      } else {
        this.updateScanTypeFromCommand = true;
      }
    },
  },
  methods: {
    async performScan() {
      this.scanning = true;
      this.scanResult = '';
      const target = document.getElementById('target').value;
      const command = document.getElementById('command').value;
      var nMapCommand = '';
      var flags = ''

      if (!target) {
        alert('A target is required.');
        this.scanning = false;
        return;
      }

      switch (this.selectedScanType) {
        case 'regular':
          flags = ''
          break;
        case 'quick':
          flags = '-T4 -F'
          break;
        case 'quick-t':
          flags = '-sn --traceroute'
          break;
        case 'intense':
          flags = '-T4 -A -v'
          break;
        case 'ping':
          flags = '-sn'
          break;
        case 'stealth':
          flags = '-sS'
          break;
        case 'os':
          flags = '-O'
          break;
        case 'aggressive':
          flags = '-A'
          break;
        case 'port':
          flags = '-p'
          break;
        case 'version':
          flags = '-sV'
          break;
      }

      var cmdArr = command.split(" ")
      var flagsArr = [];
      var element;
      for (element of cmdArr) {
        if (element.startsWith('-')){
          flagsArr.push(element)
        }
      }
      if (flags.includes('-p')) {
        var port = cmdArr[cmdArr.indexOf('-p')+1]
        if (validateCommandSyntax(nMapCommand)) {
          nMapCommand = `nmap ${flags} ${port} ${target}`;
        }
      } else if (flagsArr.length == 0){
        nMapCommand = `nmap ${target}`;
      } else {
        nMapCommand = `nmap ${flags} ${target}`;
      }

      this.loadingDots = '...';
      this.animateLoadingDots();

      if (!validateCommandSyntax(nMapCommand)){
        try {
          const response = await fetch('http://localhost:3000/scan', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ command: nMapCommand }),
          });

          if (response.ok) {
            const result = await response.json();

            this.scanResult = result.result;
            this.scanning = false;
            this.clearAll()
          } else {
            console.error('Failed to send scan request to the server.');
            this.clearAll()
            this.scanning = false;
          }
        } catch (error) {
          console.error('Error during fetch:', error);
          this.clearAll()
          this.scanning = false;
        }
      } else {
        alert(validateCommandSyntax(nMapCommand));
        this.scanning = false;
      }
    },
    
    updateCommandField() {
      const target = document.getElementById('target').value;
      var flags = ''

      switch (this.selectedScanType) {
        case 'regular':
          flags = ''
          break;
        case 'quick':
          flags = '-T4 -F'
          break;
        case 'quick-t':
          flags = '-sn --traceroute'
          break;
        case 'intense':
          flags = '-T4 -A -v'
          break;
        case 'ping':
          flags = '-sn'
          break;
        case 'stealth':
          flags = '-sS'
          break;
        case 'os':
          flags = '-O'
          break;
        case 'aggressive':
          flags = '-A'
          break;
        case 'port':
          flags = '-p'
          break;
        case 'version':
          flags = '-sV'
          break;
      }

      
      if (target && this.selectedScanType !== 'placeholder') {
        if (this.selectedScanType === 'regular'){
          this.commandField = `nmap ${target}`
        } else {
          this.commandField = `nmap ${flags} ${target}`;
        }
      } 
      this.updateScanTypeFromCommand = false;
    },
    cancelScan() {
      this.scanning = false;
    },
    clearAll(){
      this.commandField = '';
      this.targetField = '';
      this.selectedScanType = 'placeholder';
    },
    animateLoadingDots() {
      setInterval(() => {
        if (this.loadingDots.length < 3) {
          this.loadingDots += '.';
        } else {
          this.loadingDots = '';
        }
      }, 500); // Adjust the interval duration as needed
    },
  },
};
</script>


<style scoped>

</style>
