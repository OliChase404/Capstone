
 export function binarySearch(arr, search) {
    let left = 0;
    let right = arr.length - 1;
  
    while (left <= right) {
      let mid = Math.floor((left + right) / 2);
  
      if (arr[mid].name.toLowerCase().startsWith(search)) {
        let start = mid;
        let end = mid;
  
        while (start > 0 && arr[start - 1].name.toLowerCase().startsWith(search)) {
          start--;
        }
  
        while (end < arr.length - 1 && arr[end + 1].name.toLowerCase().startsWith(search)) {
          end++;
        }
  
        return arr.slice(start, end + 1);
      } else if (arr[mid].name.toLowerCase() < search) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return [];
  }