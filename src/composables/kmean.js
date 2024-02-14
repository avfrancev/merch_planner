import { groups, sort, groupSort } from 'd3-array'

const distance = (a, b) => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

const avg = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;


export default (addresses) => {
  // console.log(addresses[0].x);
  // let centroids = Array.from({ length: 5 }, (x, i) => {
  //   return {
  //     id: i,
  //     x: 0, y: 0,
  //   }
  // });

  

  // Example usage:
  // const k = 5; // Number of clusters
  // const distributedData = distributeAddresses(addresses, k);
  // console.log(distributedData);

  // Distribute addresses using k-mean clustering algorithm
  function kMeanClustering(addresses, k) {
    // Initialize centroids randomly
    const closestCentroid = (point) => {
      const distances = centroids.map(centroid => distance(point, centroid));
      const i = distances.findIndex(d => d === Math.min(...distances));
      return i;
    }

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
        const clusterIndex = closestCentroid(address);
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

    return { centroids, addresses };
  };

  ///////////////////////////////////////
  // const { centroids } = kMeanClustering(addresses, 5);
  
  // Each address have visit frequency per week property and cluster property. I want to distribute addresses along a week to days group based on cluster and visit frequency.
  // function isAddressInGroup(address, G) {
  //   return G.some(addressInGroup => addressInGroup === address);
  // }

  function getNextMinimalGroupByAddress(addresses) {
    const groupedAddressesByCluster = groups(addresses, address => address.cluster)
    const sortedGroupedAddressesByCluster = groupedAddressesByCluster.sort((a, b) => a[1].length - b[1].length);
    return sortedGroupedAddressesByCluster[0][1];
  }
  // I havr Many addresses. Each Address have a visit frequency property (it means how often address needs to be visited in days). I need to distribute addresses evenly across 5 days
  
  const distributeAddresses = (addresses) => {
    const dayAssignments = Array.from({ length: 5 }, () => []);

    addresses.forEach(address => {
      let visitFrequency = address.visit_frequency;
      // Find the day with the least number of addresses and assign the current address
      for (let i = 0; i < visitFrequency; i++) {
        let minDayIndex = dayAssignments.findIndex(day => day.length === Math.min(...dayAssignments.map(day => day.length)));
        dayAssignments[minDayIndex].push(address);
      }
    });

    return dayAssignments;
  };
  const distributedAddresses = distributeAddresses(addresses)
  console.log(distributedAddresses)
  // log count of addresses in each day and sum
  console.log(distributedAddresses.map(day => day.length).reduce((a, b) => a + b));
  // log sum of visit frequency of addresses
  console.log(addresses.map(address => address.visit_frequency).reduce((a, b) => a + b));

  const clusteredAddresses = kMeanClustering(distributedAddresses.flat(), 5);

  // Loop through each address in the addresses array
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

  const addressesGroupedByDays = ref(addresses.reduce((groups, address) => {
    let days = address.days
    // console.log(address);
    days.forEach((day, i) => {
      if (!groups[day]) {
        groups[day] = [];
      }
      // let a = {...address}
      // let a = address
      address.iid = `${address.address}_${days[i]}`
      groups[day].push(address);
    })
    return groups;
  }, {}))


  return {
    centroids,
    addressesGroupedByDays
  }
}