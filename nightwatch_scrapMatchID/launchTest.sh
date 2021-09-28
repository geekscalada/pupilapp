#!/bin/bash
status=1
timestamp=$(date +%d-%m-%Y_%H-%M-%S)
echo -e "\n Executing launchTest.sh `${timestamp}`" >>   /volume/launchTestLog.log
echo $timestamp >> /volume/launchTestLog.log
cd /volume
npx nightwatch -e firefox nightwatchPupila.js >> /volume/launchTestLog.log
#2>>launchTestLog.log
status=$?
[ $status -eq 0 ] && echo 'Test finished' || echo  'Failed' >> /volume/launchTestLog.log 
killall geckodriver >> /volume/launchTestLog.log 2>&1
killall firefox >> /volume/launchTestLog.log 2>&1
rm /tmp/rust_mozprofile* -r



