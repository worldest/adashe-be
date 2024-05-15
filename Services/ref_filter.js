    // const referrers = await connection.query(`SELECT refer_by FROM users WHERE updated_at BETWEEN '2024-01-19' AND '2024-01-26'`);
    // //console.dir({referrers}, {'maxArrayLength': null});

    // const referrersArray = referrers.filter(obj => {
    //     return Object.values(obj).some(value => value !== null && value !== 'N/A' && value !== 'None' && value !== 'oluwolemiracle14@gmail.com' && value !== 'HelenMajemite' && value !== 'Myself' && value !== 'Oziegbe');
    // });

    // console.log(referrersArray.length);

    // const uniqueNames = new Set();
    // const filteredArray = referrersArray.filter(obj => {
    // const isUnique = uniqueNames.has(obj.refer_by);
    // uniqueNames.add(obj.refer_by);
    // return !isUnique;
    // });

    // console.log(filteredArray);
    // console.log(filteredArray.length);

    // // referrersArray.map((item) => {
    // //     let array = [item.refer_by];
    // //     console.dir(array, {'maxArrayLength': null});
    // // })




            // const flutter_trf = await initTrans(getTrf[0].account_number, externalNarration, getTrf[0].amount, getTrf[0].bank_code );
                // const trf_obj = JSON.stringify(flutter_trf) || "NULL";

                // if(flutter_trf.status !== "success"){
                //     await connection.query(`UPDATE pendingTrf SET status='3' WHERE user_id='${userid}'`);
                //     await connection.query(`INSERT INTO failedTrf (account_id, user_id, amount, name, trf_obj) VALUES ('${checkUser[0].account_id}', '${userid}', '${totalDue}', 'Bank Transfer', '${trf_obj}')`);
                //     let getPushToken = await connection.query(`SELECT * FROM notificationTokens WHERE user_id=?`, [userid]);
                //     if(getPushToken.length > 0){
                //         await sendNotification(getPushToken[0].token, {title: "Transfer Notification", body: `We detected an issue with your transfer of N${amount} to ${getTrf[0].account_number}. Your money is likely to be reversed because of network instability. If reversal delays more than 2 hours please visit help center`});
                //     }
                //     let getPushToken = await connection.query(`SELECT * FROM notificationTokens WHERE user_id='3SqVmRDZFLAJpLLnSGxKJcPK5LPcMDOU'`);
                //     if(getPushToken.length > 0){
                //         await sendNotification(getPushToken[0].token, {title: "New failed Transaction", body: `A transaction just failed now. Attend to it`});
                //     }
                //     return null
                // } else if (flutter_trf.status === "success") {
                //     const sessionId = flutter_trf.data.id || session_id;
            
                //     let accountName_ = flutter_trf.data.full_name;
                //     await connection.query(`INSERT INTO transactions 
                //     (type_id, account_id, amount, user_id, receiver_id, bank_code, status, remark, verdict, transaction_type, session_id, txn_date, trf_obj, balance_before) 
                //     VALUES 
                //     ('11', '${accountId}', '${fee}', '${checkUser[0].user_id}', '${flutter_trf.data.account_number}', '${flutter_trf.data.bank_code}', '3', 'DR-Outward Transfer charges', 'completed', 'debit', '${sessionId}', '${today}', '${trf_obj}', '${balance}')`);
                    
                //     await connection.query(`INSERT INTO transactions 
                //     (type_id, account_id, amount, user_id, receiver_id, bank_code, status, remark, verdict, transaction_type, session_id, txn_date, narration, trf_obj, balance_before, profit) 
                //     VALUES 
                //     ('3', '${accountId}', '${amount}', '${checkUser[0].user_id}', '${flutter_trf.data.account_number || getTrf[0].account_number}', '${flutter_trf.data.bank_code || getTrf[0].bank_code}', '3', 'DR-NUBAN-TRF-${flutter_trf.data.bank_code || getTrf[0].bank_code}-${flutter_trf.data.account_number || getTrf[0].account_number}-${accountName_.replace("'", "")}', 'completed', 'debit', '${sessionId}', '${today}', '${getTrf[0].narration.replace("'", "")}', '${trf_obj}', '${balance}', '${profit}')`);
                //     await connection.query(`INSERT INTO transfers (ref, txn_id) VALUES ('${trf.data.id}', '${sessionId}')`);
                    
                //     let getPushToken = await connection.query(`SELECT * FROM notificationTokens WHERE user_id=?`, [userid]);
                //     if(getPushToken.length > 0){
                //         await sendNotification(getPushToken[0].token, {title: "Money Out", body: `N ${amount} has been sent to ${getTrf[0].account_number} successfully.`});
                //     }
                //     return null;
                // }