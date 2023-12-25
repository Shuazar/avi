/// <reference types="cypress" />
beforeEach(() => {
    cy.visit("https://lp.evestpartners.com/adminlogin/");
    cy.intercept("https://adminapi.cellxpert.com/?OrderBy=*").as("allAff")
})

it("navigate to aff https://lp.evestpartners.com", () => {
    let ids = []
    let str = ''
    cy.get('input[name="user"]').type("")
    cy.get('input[name="password"]').type("")
    cy.get('button[class="submit-btn"]').click({ multiple: true })
    cy.visit("https://lp.evestpartners.com/adminv2/#!/app/manage-affiliates/")
    cy.wait("@allAff", { timeout: 20000 }).then((interception) => {
        debugger
        let body = interception.response.body
        const parser = new DOMParser()
        const document = parser.parseFromString(body, 'application/xml')
        const parseIds = document.getElementsByTagName('AffiliateID')
        ids = Array.from(parseIds).map((item) => item.innerHTML)
        // ids.push(35839)
        // ids.push(35838)
        // ids.push(35836)
    }).then(() => {

        ids.forEach((item, index) => {
            cy.wait(2000)
            cy.intercept(`https://adminapi.cellxpert.com/?command=affiliatedetailsjson&netaffId=${item}*`).as("affDetails")
            cy.visit(`https://lp.evestpartners.com/adminv2/#!/app/affiliate-profile/edit/${item}`)
            cy.wait("@affDetails", { timeout: 10000 }).then((intersection) => {
                expect(intersection.response.statusCode).equal(200)
                let body = JSON.stringify(intersection.response.body)

                if (index == 0) {
                    str = body.substring(0, body.length - 2)
                }
                if (index > 0) {
                    body = body.substring(21)
                    body = body.substring(0, body.length - 2)
                    if (ids.length == index) {
                        body = body + "]}"
                    }
                    else {
                        body = ",\n" + body
                    }
                    str = str + body
                }
            })
        })
    }).then(() => {
        cy.writeFile(`C:\\temp\\affDetails.json`, str, { flag: 'a+' })
    })
});
