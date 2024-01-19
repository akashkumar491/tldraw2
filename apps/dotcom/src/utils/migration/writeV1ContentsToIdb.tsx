import { openDB } from 'idb'

const v1Contents = {
	home: JSON.parse(
		'{"settings":{"isCadSelectMode":false,"isPenMode":false,"isDarkMode":true,"isZoomSnap":false,"isFocusMode":false,"isSnapping":false,"isDebugMode":false,"isReadonlyMode":false,"keepStyleMenuOpen":false,"nudgeDistanceLarge":16,"nudgeDistanceSmall":1,"showRotateHandles":true,"showBindingHandles":true,"showCloneHandles":false,"showGrid":false,"language":"en","dockPosition":"bottom","exportBackground":"transparent"},"appState":{"status":"idle","activeTool":"draw","currentPageId":"page","currentStyle":{"color":"black","size":"small","isFilled":false,"dash":"draw","scale":1},"isToolLocked":false,"isMenuOpen":false,"isEmptyCanvas":false,"eraseLine":[],"snapLines":[],"isLoading":false,"disableAssets":false,"selectByContain":false},"document":{"id":"doc","name":"New Document","version":15.5,"pages":{"page":{"id":"page","name":"Page 1","childIndex":1,"shapes":{"9172e03a-bd79-4c2b-3abe-d16b4e3cf33f":{"id":"9172e03a-bd79-4c2b-3abe-d16b4e3cf33f","type":"draw","name":"Draw","parentId":"page","childIndex":1,"point":[431.69,168.94],"rotation":0,"style":{"color":"black","size":"small","isFilled":false,"dash":"draw","scale":1},"points":[[0,0,0.5],[0,0,0.5],[0,0.83,0.5],[0,3.31,0.5],[0,7.94,0.5],[0,16.67,0.5],[0,29.04,0.5],[0,43.27,0.5],[0,59.95,0.5],[0,78.62,0.5],[0,97.95,0.5],[0,116.69,0.5],[0,131.06,0.5],[0,145.44,0.5],[0,161.37,0.5],[0,172.49,0.5],[0,182.38,0.5],[0,191.3,0.5],[0,196.31,0.5],[0,200.31,0.5],[0,204.09,0.5],[0,206.54,0.5],[0,208.03,0.5],[0,208.77,0.5],[0,209.04,0.5],[0,209.15,0.5],[0,208.94,0.5],[0,207.75,0.5],[0,205.52,0.5],[0,202.47,0.5],[0,195.49,0.5],[0,192.03,0.5],[0,183.13,0.5],[0.25,172.63,0.5],[2.66,162.29,0.5],[7.19,152.27,0.5],[11.76,144.66,0.5],[17.02,137.91,0.5],[23.26,130.71,0.5],[28.88,125.43,0.5],[32.85,122.74,0.5],[36.32,121.08,0.5],[40.33,119.78,0.5],[43.67,119.28,0.5],[45.89,119.15,0.5],[47.84,119.58,0.5],[49.47,121.23,0.5],[51.03,124.94,0.5],[52.9,130.48,0.5],[54.69,136.93,0.5],[56.46,144.14,0.5],[58.32,152.38,0.5],[59.89,159.79,0.5],[61.09,166.49,0.5],[61.97,172.42,0.5],[62.54,177.6,0.5],[63.08,183.22,0.5],[63.56,187.41,0.5],[63.98,190.15,0.5],[64.33,191.82,0.5],[64.47,192.74,0.5],[64.47,193.29,0.5]],"isComplete":true},"9cfd08a9-0e26-4cbc-1a6f-8507ac58840e":{"id":"9cfd08a9-0e26-4cbc-1a6f-8507ac58840e","type":"draw","name":"Draw","parentId":"page","childIndex":2,"point":[496.61,282.12],"rotation":0,"style":{"color":"black","size":"small","isFilled":false,"dash":"draw","scale":1},"points":[[23.03,46.08,0.5],[23.03,46.08,0.5],[23.25,46.08,0.5],[24.04,46.08,0.5],[26.3,46.08,0.5],[29.46,46.08,0.5],[32.5,46.08,0.5],[37.44,46.08,0.5],[44.54,46.08,0.5],[50.28,46.08,0.5],[54.64,46.08,0.5],[59.52,45.59,0.5],[64.01,44.39,0.5],[67.72,42.79,0.5],[71.12,40.77,0.5],[73.91,38.75,0.5],[75.69,36.93,0.5],[76.96,34.58,0.5],[78,31.96,0.5],[78.84,29.48,0.5],[79.5,26.55,0.5],[79.75,23.36,0.5],[79.77,20.04,0.5],[79.77,16.68,0.5],[79.74,13.24,0.5],[79.47,9.78,0.5],[78.85,7.65,0.5],[77.8,5.95,0.5],[76.32,3.88,0.5],[74.46,2.29,0.5],[71.89,0.92,0.5],[69.07,0.12,0.5],[66.18,0,0.5],[62.91,0,0.5],[59.16,0,0.5],[54.92,0.38,0.5],[49.27,2.6,0.5],[42.42,6.97,0.5],[35.97,12.44,0.5],[29.71,18.82,0.5],[23.27,25.81,0.5],[18.09,31.78,0.5],[13.78,37.7,0.5],[9.19,44.64,0.5],[5.5,51.15,0.5],[3.46,55.72,0.5],[2.21,59.28,0.5],[0.97,63.44,0.5],[0.21,67.06,0.5],[0,69.8,0.5],[0,72.32,0.5],[0.02,75.09,0.5],[0.41,77.8,0.5],[1.89,80.11,0.5],[4.15,82.33,0.5],[6.73,84.55,0.5],[9.87,86.85,0.5],[13.57,89.18,0.5],[17.74,91.21,0.5],[23.4,93.11,0.5],[30.11,94.9,0.5],[36.06,96.09,0.5],[42.04,96.93,0.5],[48.39,97.63,0.5],[54.27,98.17,0.5],[58.77,98.53,0.5],[63.26,98.61,0.5],[68.19,98.61,0.5],[72.31,98.27,0.5],[76.22,97.05,0.5],[79.93,95.29,0.5],[83.83,92.89,0.5],[88.14,89.74,0.5],[91.92,86.01,0.5]],"isComplete":true},"a4d8e089-da35-4691-33b1-cca4291f3ddb":{"id":"a4d8e089-da35-4691-33b1-cca4291f3ddb","type":"draw","name":"Draw","parentId":"page","childIndex":3,"point":[625.08,260.15],"rotation":0,"style":{"color":"black","size":"small","isFilled":false,"dash":"draw","scale":1},"points":[[0,20.72,0.5],[0,20.72,0.5],[0,21.19,0.5],[0,22.55,0.5],[0,25.3,0.5],[0,29.71,0.5],[0,34.96,0.5],[0,41.62,0.5],[0,50.79,0.5],[0,60.42,0.5],[0,68.86,0.5],[0,75.54,0.5],[0,81.74,0.5],[0,88.59,0.5],[0,94.09,0.5],[0,97.64,0.5],[0,100.67,0.5],[0,103.31,0.5],[0,104.98,0.5],[0,106.08,0.5],[0,106.58,0.5],[0,106.59,0.5],[0,105.88,0.5],[0,103.95,0.5],[0,101.12,0.5],[0,96.28,0.5],[1.43,88.45,0.5],[4.55,79.33,0.5],[8.81,68.87,0.5],[14.98,56.77,0.5],[22.46,44.42,0.5],[30.55,32.89,0.5],[38.67,23.33,0.5],[45.37,16.98,0.5],[51.08,12.18,0.5],[55.92,8.42,0.5],[60.24,5.55,0.5],[64.79,2.94,0.5],[68.77,1.23,0.5],[72.22,0.25,0.5],[75.03,0,0.5],[77.22,0,0.5],[78.88,0,0.5],[80.29,0,0.5],[81.56,0,0.5],[82.62,0,0.5],[83.44,0.1,0.5]],"isComplete":true},"f54ec6aa-8e04-429a-288b-b22c5066c083":{"id":"f54ec6aa-8e04-429a-288b-b22c5066c083","type":"draw","name":"Draw","parentId":"page","childIndex":4,"point":[688.7,288.06],"rotation":0,"style":{"color":"black","size":"small","isFilled":false,"dash":"draw","scale":1},"points":[[14.44,38.57,0.5],[14.44,38.57,0.5],[14.93,38.57,0.5],[17.05,38.57,0.5],[20.85,38.57,0.5],[25.65,38.57,0.5],[30.17,38.57,0.5],[34.68,38.57,0.5],[39.75,38.57,0.5],[44.45,38.57,0.5],[48.79,38.57,0.5],[52.6,38.35,0.5],[55.7,37.71,0.5],[58.21,36.63,0.5],[60.4,34.86,0.5],[62.46,32.22,0.5],[64.19,29.15,0.5],[65.32,25.53,0.5],[65.94,21.45,0.5],[66.23,17.88,0.5],[66.28,14.19,0.5],[66.28,10.73,0.5],[66.28,8.77,0.5],[66.28,7.29,0.5],[65.57,5.27,0.5],[64.44,3.62,0.5],[63.07,2.75,0.5],[61.32,1.82,0.5],[59.15,1.02,0.5],[56.03,0.39,0.5],[53.03,0,0.5],[50.22,0,0.5],[46.57,0,0.5],[40.79,0.33,0.5],[34.33,1.74,0.5],[29.01,3.85,0.5],[23.29,6.16,0.5],[17.14,8.72,0.5],[12.24,10.84,0.5],[8.89,12.32,0.5],[6.07,13.74,0.5],[3.55,15.23,0.5],[1.74,16.62,0.5],[0.74,17.88,0.5],[0.27,19.09,0.5],[0.05,20.64,0.5],[0,22.48,0.5],[0,25.13,0.5],[0,28.65,0.5],[0,32.96,0.5],[0,38.33,0.5],[0.8,44.54,0.5],[2.4,51.09,0.5],[4.34,57.48,0.5],[6.71,63.83,0.5],[9.53,69.63,0.5],[12.69,74.54,0.5],[15.86,78.53,0.5],[19.43,81.67,0.5],[23.48,84.29,0.5],[27.5,86.04,0.5],[31.44,86.85,0.5],[35.82,87.24,0.5],[41,87.39,0.5],[47.53,87.09,0.5],[54.47,86.01,0.5],[61.31,83.49,0.5],[68.22,79.99,0.5]],"isComplete":true},"640adf82-c8fd-4e93-18c4-2d8ae7817181":{"id":"640adf82-c8fd-4e93-18c4-2d8ae7817181","type":"draw","name":"Draw","parentId":"page","childIndex":5,"point":[880.73,291.19],"rotation":0,"style":{"color":"black","size":"small","isFilled":false,"dash":"draw","scale":1},"points":[[0,0,0.5],[0,0,0.5],[0,0.78,0.5],[0,3.52,0.5],[0,8.19,0.5],[0,14.22,0.5],[0,21.85,0.5],[0,30.52,0.5],[0,39.61,0.5],[0,48.76,0.5],[0,56.85,0.5],[0,62.9,0.5],[0,68.78,0.5],[0,75.83,0.5],[0,82.39,0.5],[0,88.28,0.5],[0,93.72,0.5],[0,97.54,0.5],[0,100.06,0.5],[0,102.63,0.5]],"isComplete":true},"018da8ea-206c-45f7-035c-575e3458cc70":{"id":"018da8ea-206c-45f7-035c-575e3458cc70","type":"draw","name":"Draw","parentId":"page","childIndex":6,"point":[879.72,270.57],"rotation":0,"style":{"color":"black","size":"small","isFilled":false,"dash":"draw","scale":1},"points":[[0,0.13,0.5],[0,0.13,0.5],[0,0,0.5]],"isComplete":true},"89f2a71a-bb44-4bf5-0501-a313d2aaf166":{"id":"89f2a71a-bb44-4bf5-0501-a313d2aaf166","type":"draw","name":"Draw","parentId":"page","childIndex":7,"point":[900.76,273.82],"rotation":0,"style":{"color":"black","size":"small","isFilled":false,"dash":"draw","scale":1},"points":[[39.03,0,0.5],[39.03,0,0.5],[38.27,0,0.5],[36.36,0.05,0.5],[34.06,0.43,0.5],[31.29,1.43,0.5],[27.58,3.04,0.5],[24.47,4.56,0.5],[21.41,6.37,0.5],[17.77,8.52,0.5],[15.42,9.94,0.5],[13.58,11.49,0.5],[11.6,13.11,0.5],[10.36,14.37,0.5],[9.7,15.52,0.5],[9.28,16.25,0.5],[9.15,16.64,0.5],[9.15,16.95,0.5],[9.15,17.37,0.5],[9.15,17.87,0.5],[9.37,18.73,0.5],[10.38,20.22,0.5],[12.26,22.21,0.5],[14.58,24.54,0.5],[17.08,27.14,0.5],[19.44,29.72,0.5],[21.45,31.83,0.5],[23.79,34.34,0.5],[26.57,37.37,0.5],[28.66,39.68,0.5],[30.38,41.58,0.5],[32.24,43.65,0.5],[33.91,45.68,0.5],[35.55,47.73,0.5],[37.01,49.6,0.5],[38.14,51.26,0.5],[39.19,52.98,0.5],[39.98,54.7,0.5],[40.59,56.23,0.5],[41.06,57.31,0.5],[41.21,58.27,0.5],[41.23,59.11,0.5],[41.23,59.7,0.5],[41.23,60.3,0.5],[41.15,60.9,0.5],[40.65,61.45,0.5],[39.45,62.01,0.5],[37.61,62.83,0.5],[35.31,63.84,0.5],[32.71,64.96,0.5],[29.47,66.3,0.5],[25.34,67.75,0.5],[20.62,69.27,0.5],[16.31,70.5,0.5],[12.85,71.32,0.5],[9.62,72.12,0.5],[6.69,72.84,0.5],[4.28,73.32,0.5],[2.44,73.7,0.5],[1.29,73.91,0.5],[0.62,73.95,0.5],[0.17,73.95,0.5],[0,73.95,0.5]],"isComplete":true},"7d248229-1136-41d2-1cfd-717896f81fc6":{"id":"7d248229-1136-41d2-1cfd-717896f81fc6","type":"draw","name":"Draw","parentId":"page","childIndex":8,"point":[484.11,450.09],"rotation":0,"style":{"color":"black","size":"small","isFilled":false,"dash":"draw","scale":1},"points":[[13.92,8.39,0.5],[13.92,8.39,0.5],[13.79,8.27,0.5],[13.32,8.14,0.5],[12.38,8.14,0.5],[10.83,8.14,0.5],[8.93,8.14,0.5],[7.02,8.14,0.5],[5.5,8.14,0.5],[3.85,8.29,0.5],[2.12,8.99,0.5],[1.15,10.1,0.5],[0.52,11.47,0.5],[0.11,13.24,0.5],[0,15.16,0.5],[0,17.06,0.5],[0,18.96,0.5],[0,21.04,0.5],[0,23.39,0.5],[0,25.69,0.5],[0,27.9,0.5],[0,29.75,0.5],[0,32,0.5],[0,34.16,0.5],[0,35.41,0.5],[0,36.69,0.5],[0,37.91,0.5],[0,39.09,0.5],[0,40.09,0.5],[0.13,40.47,0.5],[0.42,40.77,0.5],[0.87,41.18,0.5],[1.46,41.32,0.5],[2.06,41.32,0.5],[2.65,41.32,0.5],[3.28,41.32,0.5],[4.19,41.16,0.5],[5.55,40.26,0.5],[7.23,38.58,0.5],[9.15,36.72,0.5],[11.46,34.43,0.5],[14.25,31.28,0.5],[17.27,27.77,0.5],[20.12,24.14,0.5],[22.86,20.41,0.5],[25.07,17.3,0.5],[26.78,14.63,0.5],[28.46,11.86,0.5],[29.89,9.24,0.5],[31.09,6.97,0.5],[31.94,5,0.5],[32.53,3.29,0.5],[33.05,2.02,0.5],[33.38,1.18,0.5],[33.67,0.58,0.5],[34.09,0,0.5],[34.21,0,0.5],[34.46,0,0.5],[34.73,0.02,0.5],[34.98,0.28,0.5],[35.12,1.18,0.5],[35.33,2.4,0.5],[35.67,3.64,0.5],[36.02,5.14,0.5],[36.41,7.12,0.5],[36.9,9.71,0.5],[37.61,12.34,0.5],[38.53,14.82,0.5],[39.82,17.49,0.5],[41.21,20.04,0.5],[42.37,22.41,0.5],[43.69,24.86,0.5],[45.12,27.05,0.5],[46.34,28.98,0.5],[47.28,30.52,0.5],[47.97,31.57,0.5],[48.48,32.39,0.5],[48.81,32.91,0.5],[49.08,33.2,0.5],[49.23,33.35,0.5]],"isComplete":true},"40a6d973-88ac-4c50-168c-3c2b30abdf85":{"id":"40a6d973-88ac-4c50-168c-3c2b30abdf85","type":"draw","name":"Draw","parentId":"page","childIndex":9,"point":[607.9,419.71],"rotation":0,"style":{"color":"black","size":"small","isFilled":false,"dash":"draw","scale":1},"points":[[0.78,27.73,0.5],[0.78,27.73,0.5],[0.78,28.31,0.5],[0.78,29.73,0.5],[0.78,31.43,0.5],[0.78,34.65,0.5],[0.78,39.75,0.5],[0.78,43.98,0.5],[0.78,48.71,0.5],[0.78,54.72,0.5],[0.78,59.82,0.5],[0.78,65.32,0.5],[0.78,71.11,0.5],[0.78,75.25,0.5],[0.78,78,0.5],[0.78,80.75,0.5],[0.78,83.33,0.5],[0.78,85.05,0.5],[0.78,86.02,0.5],[0.78,86.45,0.5],[0.77,86.27,0.5],[0.6,85.28,0.5],[0.41,83.55,0.5],[0.19,81.04,0.5],[0,77.7,0.5],[0,72.77,0.5],[0.14,66.51,0.5],[0.94,59.77,0.5],[2.48,52.7,0.5],[4.4,46.31,0.5],[6.98,39.53,0.5],[10.19,31.95,0.5],[13.69,24.59,0.5],[17.27,17.7,0.5],[20.83,11.84,0.5],[24.29,7.33,0.5],[27.07,4.53,0.5],[29.41,2.85,0.5],[31.66,1.41,0.5],[33.89,0.42,0.5],[35.9,0.06,0.5],[37.64,0,0.5],[39.27,0,0.5],[40.5,0,0.5],[41.78,0.52,0.5],[43,1.47,0.5],[44.42,3.3,0.5],[45.93,5.44,0.5],[46.91,7.42,0.5],[47.89,9.65,0.5],[48.9,12.19,0.5],[49.71,14.86,0.5],[50.26,16.86,0.5],[50.66,19.22,0.5],[51.02,21.94,0.5],[51.17,24.4,0.5],[51.17,26.76,0.5],[51.17,28.85,0.5],[51.17,30.66,0.5],[50.92,32.13,0.5],[49.89,33.43,0.5],[48.12,34.79,0.5],[46.17,36.06,0.5],[43.87,37.13,0.5],[40.78,38.24,0.5],[37.14,39.4,0.5],[33.47,40.38,0.5],[29.51,41.14,0.5],[25.05,41.9,0.5],[21.58,42.6,0.5],[18.68,43.07,0.5],[15.54,43.32,0.5],[12.83,43.51,0.5],[10.44,43.7,0.5],[8.62,43.74,0.5],[7.44,43.74,0.5],[6.68,43.74,0.5],[6.26,43.72,0.5],[6.02,43.58,0.5]],"isComplete":true},"b7b78106-962a-4623-21a3-23afa9f04365":{"id":"b7b78106-962a-4623-21a3-23afa9f04365","type":"draw","name":"Draw","parentId":"page","childIndex":10,"point":[671.95,431.84],"rotation":0,"style":{"color":"black","size":"small","isFilled":false,"dash":"draw","scale":1},"points":[[0,24.97,0.5],[0,24.97,0.5],[0,24.86,0.5],[0,24.9,0.5],[0,25.71,0.5],[0,27.33,0.5],[0,29.36,0.5],[0,31.85,0.5],[0,34.62,0.5],[0,36.71,0.5],[0,38.11,0.5],[0,39.6,0.5],[0,40.96,0.5],[0,41.87,0.5],[0,42.3,0.5],[0,42.23,0.5],[0,41.37,0.5],[0,39.96,0.5],[0,38.48,0.5],[0.03,36.54,0.5],[0.41,33.44,0.5],[1.59,29.23,0.5],[3.53,25.43,0.5],[6.5,21.89,0.5],[10.23,18.07,0.5],[14.22,14.44,0.5],[18.58,10.96,0.5],[22.99,8.06,0.5],[27.27,5.68,0.5],[30.93,3.89,0.5],[33.78,2.68,0.5],[36.63,1.6,0.5],[39.51,0.79,0.5],[41.87,0.3,0.5],[43.68,0.05,0.5],[45,0,0.5],[45.87,0,0.5],[46.37,0,0.5],[46.67,0,0.5],[46.92,0,0.5],[47.06,0,0.5]],"isComplete":true},"90453293-c9a0-45fd-11af-0f8d6778a15d":{"id":"90453293-c9a0-45fd-11af-0f8d6778a15d","type":"draw","name":"Draw","parentId":"page","childIndex":11,"point":[719.75,449.17],"rotation":0,"style":{"color":"black","size":"small","isFilled":false,"dash":"draw","scale":1},"points":[[12.37,0,0.5],[12.37,0,0.5],[12.37,0.23,0.5],[12.05,0.89,0.5],[10.49,3.3,0.5],[8.2,7.48,0.5],[6.5,11.12,0.5],[5.37,14.15,0.5],[3.96,18.24,0.5],[2.4,23.34,0.5],[1.2,28.98,0.5],[0.36,33.94,0.5],[0.05,37.95,0.5],[0,42.19,0.5],[0,45.85,0.5],[0,48.12,0.5],[0,50.13,0.5],[0,52.55,0.5],[0.02,54.45,0.5],[0.29,56.11,0.5],[1.1,57.75,0.5],[2.25,59.02,0.5],[3.59,60.03,0.5],[5.14,60.74,0.5],[6.98,61.3,0.5],[9.28,61.75,0.5],[11.64,61.88,0.5],[13.83,61.88,0.5],[16.16,61.77,0.5],[18.52,61.14,0.5],[20.82,59.63,0.5],[23.19,57.55,0.5],[25.52,55.02,0.5],[28.06,51.85,0.5],[30.59,48.05,0.5],[32.93,43.68,0.5],[35.48,38.76,0.5],[37.47,34.53,0.5],[38.98,30.91,0.5],[40.44,26.82,0.5],[41.59,23.41,0.5],[42.45,20.63,0.5],[42.94,18.24,0.5],[43.32,16.33,0.5],[43.5,14.93,0.5],[43.5,14.16,0.5],[43.5,13.59,0.5],[43.47,13.19,0.5],[43.27,12.91,0.5],[42.8,12.62,0.5],[42.2,12.37,0.5],[41.6,12.21,0.5],[40.93,12,0.5],[40.07,11.68,0.5],[38.89,11.26,0.5],[37.35,10.62,0.5],[35.67,9.88,0.5],[33.86,9.01,0.5],[32.09,8.08,0.5],[30.41,7.26,0.5],[28.6,6.38,0.5],[26.7,5.44,0.5],[25.13,4.65,0.5],[24.02,4.11,0.5],[23.04,3.74,0.5],[22.25,3.44,0.5],[21.77,3.27,0.5],[21.47,3.24,0.5],[21.2,3.24,0.5],[20.92,3.24,0.5],[20.65,3.24,0.5],[20.48,3.24,0.5],[20.27,3.24,0.5],[19.84,3.24,0.5],[19.57,3.26,0.5],[19.3,3.42,0.5],[19.03,3.65,0.5],[18.76,3.75,0.5],[18.49,3.75,0.5],[18.27,3.8,0.5],[18.13,3.93,0.5],[17.94,4,0.5],[17.67,4,0.5],[17.4,4,0.5],[17.21,4,0.5],[17.06,4,0.5],[16.94,4,0.5],[16.8,4,0.5],[16.68,4,0.5],[16.66,4.11,0.5]],"isComplete":true},"7a17b436-ac36-4c40-30e7-83c7b1bb482c":{"id":"7a17b436-ac36-4c40-30e7-83c7b1bb482c","type":"draw","name":"Draw","parentId":"page","childIndex":12,"point":[771.25,444.22],"rotation":0,"style":{"color":"black","size":"small","isFilled":false,"dash":"draw","scale":1},"points":[[16.77,0,0.5],[16.77,0,0.5],[16.77,0.59,0.5],[16.77,2.22,0.5],[16.77,4.96,0.5],[16.77,9.02,0.5],[16.77,12.88,0.5],[16.77,16.62,0.5],[16.77,21.1,0.5],[16.77,25.72,0.5],[16.77,30.46,0.5],[16.77,34.85,0.5],[16.77,39.14,0.5],[16.77,43.43,0.5],[16.77,47.18,0.5],[16.77,49.92,0.5],[16.77,52.18,0.5],[16.77,54.74,0.5],[16.77,57.14,0.5],[16.77,58.95,0.5],[16.77,60.27,0.5],[16.77,61.13,0.5],[16.5,61.92,0.5],[16.07,62.44,0.5],[15.66,62.62,0.5],[15.12,62.88,0.5],[14.29,63.05,0.5],[13.29,63.07,0.5],[12.32,63.07,0.5],[11.1,63.04,0.5],[9.7,62.82,0.5],[8.51,62.3,0.5],[7.29,61.62,0.5],[5.92,60.91,0.5],[4.76,60.23,0.5],[3.79,59.64,0.5],[2.89,59.16,0.5],[2.09,58.69,0.5],[1.3,58.22,0.5],[0.59,57.77,0.5],[0,57.39,0.5]],"isComplete":true},"b62f199c-4c4c-4c19-178f-5222c676d797":{"id":"b62f199c-4c4c-4c19-178f-5222c676d797","type":"draw","name":"Draw","parentId":"page","childIndex":13,"point":[789.25,428.83],"rotation":0,"style":{"color":"black","size":"small","isFilled":false,"dash":"draw","scale":1},"points":[[0,0,0.5],[0,0,0.5]],"isComplete":true},"5dd77884-e1ef-413e-0538-09ba647dddff":{"id":"5dd77884-e1ef-413e-0538-09ba647dddff","type":"draw","name":"Draw","parentId":"page","childIndex":14,"point":[797.87,439.15],"rotation":0,"style":{"color":"black","size":"small","isFilled":false,"dash":"draw","scale":1},"points":[[0,24.51,0.5],[0,24.51,0.5],[0.12,24.51,0.5],[0.61,24.51,0.5],[1.66,24.51,0.5],[3.1,24.51,0.5],[5.11,24.51,0.5],[7.57,24.51,0.5],[10.02,24.51,0.5],[12.43,24.51,0.5],[14.47,24.51,0.5],[15.93,24.51,0.5],[17.43,24.51,0.5],[19.01,24.51,0.5],[20.52,24.51,0.5],[22.08,24.44,0.5],[23.22,24.14,0.5],[24.16,23.47,0.5],[25.04,22.61,0.5],[25.7,21.75,0.5],[26.49,20.13,0.5],[27.24,17.81,0.5],[27.7,15.52,0.5],[27.96,13.68,0.5],[28.15,12.16,0.5],[28.34,10.26,0.5],[28.38,8.36,0.5],[28.38,6.6,0.5],[28.38,4.94,0.5],[28.38,3.63,0.5],[28.38,2.56,0.5],[28.36,1.77,0.5],[28.04,1.18,0.5],[27.44,0.75,0.5],[26.62,0.46,0.5],[25.63,0.29,0.5],[24.67,0.13,0.5],[23.5,0,0.5],[21.72,0,0.5],[19.74,0,0.5],[17.82,0,0.5],[15.87,0,0.5],[13.83,0.09,0.5],[11.75,0.46,0.5],[9.93,1.23,0.5],[8.33,2.16,0.5],[7,3.07,0.5],[5.89,3.93,0.5],[5.01,4.76,0.5],[4.31,5.68,0.5],[3.77,6.66,0.5],[3.4,7.64,0.5],[3.09,8.45,0.5],[2.91,9.2,0.5],[2.88,10.15,0.5],[2.88,11.1,0.5],[2.88,12.26,0.5],[2.88,13.72,0.5],[2.88,15.15,0.5],[2.88,16.58,0.5],[2.88,18.35,0.5],[2.88,20.79,0.5],[2.88,22.92,0.5],[2.88,24.7,0.5],[2.88,26.92,0.5],[2.88,29.03,0.5],[2.95,30.93,0.5],[3.34,32.83,0.5],[4.25,34.67,0.5],[5.49,36.32,0.5],[6.92,37.85,0.5],[8.74,39.44,0.5],[11.09,41.01,0.5],[13.59,42.23,0.5],[16.04,43.26,0.5],[18.73,44.15,0.5],[21.71,44.88,0.5],[25.04,45.54,0.5],[28.74,46.06,0.5],[32.38,46.34,0.5],[36.11,46.38,0.5],[40.3,46.38,0.5],[44.76,46.38,0.5],[48.86,45.71,0.5],[54.63,42.61,0.5],[55.97,41.65,0.5],[59.95,37.24,0.5]],"isComplete":true},"c09756a6-bac3-4b27-36fb-156810148e2f":{"id":"c09756a6-bac3-4b27-36fb-156810148e2f","type":"draw","name":"Draw","parentId":"page","childIndex":15,"point":[876.3,434.91],"rotation":0,"style":{"color":"black","size":"small","isFilled":false,"dash":"draw","scale":1},"points":[[14.44,0,0.5],[14.44,0,0.5],[13.97,0,0.5],[12.47,0,0.5],[10.91,0,0.5],[8.94,0.38,0.5],[6.2,1.37,0.5],[4.72,2,0.5],[3.77,2.61,0.5],[1.66,4.56,0.5],[0.16,6.61,0.5],[0,7.74,0.5],[0,8.4,0.5],[0,9.5,0.5],[0,11.74,0.5],[0,13.88,0.5],[0,15.63,0.5],[0,17.73,0.5],[0,20.42,0.5],[0.21,23.92,0.5],[1.22,27.95,0.5],[3.13,31.36,0.5],[5.75,34.45,0.5],[9.25,38.14,0.5],[13.29,41.59,0.5],[16.49,43.73,0.5],[18.97,45.3,0.5],[21.89,46.86,0.5],[24.58,48.05,0.5],[26.63,48.87,0.5],[28.33,49.31,0.5],[29.75,49.52,0.5],[31.09,49.54,0.5],[32.79,49.54,0.5],[34.53,49.53,0.5],[36.81,48.4,0.5]],"isComplete":true},"b7cfd422-2dc9-4a7e-03ff-af2b7b7f900a":{"id":"b7cfd422-2dc9-4a7e-03ff-af2b7b7f900a","type":"draw","name":"Draw","parentId":"page","childIndex":16,"point":[931.81,414.66],"rotation":0,"style":{"color":"black","size":"small","isFilled":false,"dash":"draw","scale":1},"points":[[0,0,0.5],[0,0,0.5],[0,0.59,0.5],[0,2.43,0.5],[0,5.25,0.5],[0,9.29,0.5],[0,14.57,0.5],[0,21.09,0.5],[0,25.83,0.5],[0,29.73,0.5],[0,33.41,0.5],[0,36.05,0.5],[0,39.06,0.5],[0,41.14,0.5],[0,42.64,0.5],[0,43.36,0.5],[0,43.59,0.5],[0.33,43.68,0.5],[0.97,43.68,0.5],[1.88,43.68,0.5],[3.07,43.68,0.5],[4.27,43.68,0.5],[5.78,43.68,0.5],[7.44,43.68,0.5],[8.89,43.68,0.5],[10.3,43.68,0.5],[11.68,43.54,0.5],[13.53,43.19,0.5],[15.61,42.8,0.5],[17.87,42.2,0.5],[19.92,41.59,0.5],[21.58,41.22,0.5],[23.78,40.61,0.5],[25.92,40,0.5],[27.53,39.47,0.5],[28.89,38.95,0.5],[29.99,38.46,0.5],[30.75,38.01,0.5],[31.3,37.71,0.5],[31.63,37.43,0.5]],"isComplete":true},"866e0da3-b1cd-44aa-3365-fd74d9ca2088":{"id":"866e0da3-b1cd-44aa-3365-fd74d9ca2088","type":"draw","name":"Draw","parentId":"page","childIndex":17,"point":[920.87,441.08],"rotation":0,"style":{"color":"black","size":"small","isFilled":false,"dash":"draw","scale":1},"points":[[0,0,0.5],[0,0,0.5],[0.47,0,0.5],[1.42,0,0.5],[3.15,0,0.5],[5.63,0,0.5],[8.38,0,0.5],[11.44,0,0.5],[14.83,0,0.5],[18.27,0,0.5],[20.33,0,0.5],[22.12,0,0.5],[24.03,0,0.5],[24.97,0,0.5],[25.68,0,0.5],[26.11,0,0.5]],"isComplete":true}},"bindings":{}}},"pageStates":{"page":{"id":"page","selectedIds":[],"camera":{"point":[0,0],"zoom":1},"editingId":null}},"assets":{}}}'
	),
	home_version: 15.5,
}

export async function writeV1ContentsToIdb() {
	const db = await openDB('keyval-store', 1)
	const tx = db.transaction('keyval', 'readwrite')
	const store = tx.objectStore('keyval')
	for (const [key, value] of Object.entries(v1Contents)) {
		store.put(value, key)
	}
	await tx.done
}
