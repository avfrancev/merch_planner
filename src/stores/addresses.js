import { defineStore } from 'pinia'
import { interpolateRainbow } from 'd3-scale-chromatic'
import { groups, sort, groupSort } from 'd3-array'

import SAMPLE_DATA_1 from 'src/sample_data/addresses.json'
import SAMPLE_DATA_2 from 'src/sample_data/addresses2.json'

const distance = (a, b) => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

const avg = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;

const closestCentroid = (point, centroids) => {
  const distances = centroids.map(centroid => distance(point, centroid));
  const i = distances.findIndex(d => d === Math.min(...distances));
  return i;
}

function kMeanClustering(addresses, k) {
  // Initialize centroids randomly

  let centroids = addresses.slice(0, k).map(address => ({
    x: address.x,
    y: address.y
  }));

  let hasChanged = true;
  let iterations = 0;
  const maxIterations = 100; // Set a limit to avoid infinite loops

  while (hasChanged && iterations < maxIterations) {
    hasChanged = false;
    iterations++;

    // Assign clusters to addresses
    addresses.forEach(address => {
      const clusterIndex = closestCentroid(address, centroids);
      if (address.cluster !== clusterIndex) {
        hasChanged = true;
        address.cluster = clusterIndex;
      }
    });

    // Update centroids position to the average of their cluster
    centroids = centroids.map((_, centroidIndex) => {
      const clusterAddresses = addresses.filter(address => address.cluster === centroidIndex);
      if (clusterAddresses.length === 0) return centroids[centroidIndex];
      return {
        x: avg(clusterAddresses.map(address => address.x)),
        y: avg(clusterAddresses.map(address => address.y))
      };
    });
  }

  return { centroids };
};

function distributeAddressesByDays(addresses) {
  addresses.forEach(address => {
    // Initialize the days array for the current address
    address.days = [];
    // Get the visit frequency and assigned cluster for the address
    let visitFrequency = address.visit_frequency;
    let assignedCluster = address.cluster;
    // Add the assigned cluster to the days array
    address.days.push(assignedCluster);
    
    // Group the addresses by cluster
    const groupedAddressesByCluster = groups(addresses, address => address.cluster);
    // Sort the grouped addresses by cluster based on the number of addresses in each group
    const sortedGroupedAddressesByCluster = groupedAddressesByCluster.sort((a, b) => a[1].length - b[1].length);
    // Get the ID of the group with the minimal number of addresses
    let minimalGroupID = sortedGroupedAddressesByCluster[0][0];

    // Iterate from 1 to visitFrequency
    for (let i = 1; i < visitFrequency; i++) {
      // Check if the minimalGroupID % 5 is already in the days array for the address
      const isAddressInDays = address.days.includes(minimalGroupID % 5);
      // If it's not in the days array, add it
      if (!isAddressInDays)
        address.days.push(minimalGroupID % 5);
      // If it's already in the days array, increment minimalGroupID and add the new value to the days array
      else {
        address.days.push(++minimalGroupID % 5);
      }
    }
  });
}

function groupAddressesByDays(addresses) {
  return addresses.reduce((groups, address) => {
    let days = address.days
    days.forEach((day, i) => {
      if (!groups[day]) {
        groups[day] = [];
      }
      address.iid = `${address.address}_${days[i]}`
      groups[day].push(address);
    })
    return groups;
  }, {})
}


export const useAddressesStore = defineStore('addresses', () => {
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт']; 
  const colors = Array.from(Array(5)).map((d,i) => {
    return interpolateRainbow(i/5)
  })
  const currDay = ref(-1)
  const addresses = reactive([])
  const centroids = ref([])

  const addressesGroupedByDays = ref([])
  // const addressesGroupedByDays = computed(() => {
  //   console.log('-----');
  //   return addresses.reduce((groups, address) => {
  //     let days = address.days
  //     days.forEach((day, i) => {
  //       if (!groups[day]) {
  //         groups[day] = [];
  //       }
  //       address.iid = `${address.address}_${days[i]}`
  //       groups[day].push(address);
  //     })
  //     return groups;
  //   }, {})
  // })



  function updateAddresses(data) {
    addresses.splice(0, addresses.length, ...data)
    
    addresses.forEach( (d,i) => {
      d.id = i
      d.cluster = 0
      d.x = computedEager(() => {
        if (d.ya.features?.length > 0) {
          return d.ya?.features[0].geometry?.coordinates[0]
        }
        return d.ya?.geometry?.coordinates[0] || 0
      })
      d.y = computedEager(() => {
        if (d.ya?.features?.length > 0) {
          return d.ya?.features[0].geometry?.coordinates[1]
        }
        return d.ya?.geometry?.coordinates[1] || 0
      })
      d.pieChartStyles = computedEager(() => {
        if (!d.days) return null
        const numOfDays = d.days.sort((a,b) => b - a).length;
        const gradientFragments = d.days.map((day, index) => {
          const color = colors[day % colors.length];
          const share = 100 / numOfDays;
          const start = share * index;
          const end = start + share;
          return `${color} ${start}% ${end}%`;
        });
        return {
          background: `conic-gradient(${gradientFragments.join(', ')})`
        };
      });
      d.isInDay = computed(() => {
        return d.days?.includes(currDay.value) || currDay.value === -1
      })
    })

    centroids.value = kMeanClustering(addresses, 5).centroids

    distributeAddressesByDays(addresses)
    
    addressesGroupedByDays.value = groupAddressesByDays(addresses)
  }


  function loadSampleData() {
    updateAddresses(SAMPLE_DATA_1)
  }
  

  return { days, colors, currDay, addresses, updateAddresses, loadSampleData, centroids, addressesGroupedByDays }
})